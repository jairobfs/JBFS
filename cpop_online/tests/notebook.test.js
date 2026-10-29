'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
process.env.CRAFT_API_KEY='test-server-encryption-key';process.env.CRAFT_API_BASE='https://connect.craft.do/link/server/api/v1';process.env.CRAFT_COLLECTION_ID='a129558e-4d81-0531-8b07-acf4c126cc7c';
const {hash}=require('../api/_access'),handler=require('../api/_notebook'),codehash=hash('test-code');let notes=[];const original=global.fetch;
global.fetch=async(url,o={})=>{let result;if(url.includes('/collections/5ce6423e'))result={items:[{id:'config',properties:{codehash}}]};else if(url.endsWith('/documents'))result={items:[{id:'11111111-1111-1111-1111-111111111111',title:'Meu caderno'}]};else if(o.method==='POST'){notes.push({id:'note-'+notes.length,markdown:JSON.parse(o.body).markdown});result={items:notes};}else if(o.method==='PUT'){const b=JSON.parse(o.body).blocks[0];notes.find(n=>n.id===b.id).markdown=b.markdown;result={items:notes};}else result={data:notes};return {ok:true,json:async()=>result,text:async()=>JSON.stringify(result)};};
const call=(method,body,cookie='')=>new Promise((resolve,reject)=>{const headers={};handler({method,body,headers:{cookie}},{setHeader(k,v){headers[k]=v;},statusCode:200,end(x){resolve({status:this.statusCode,body:JSON.parse(x),headers});}}).catch(reject);});
test.after(()=>global.fetch=original);
test('conexão pessoal restringe domínio, protege credencial e atualiza a mesma anotação',async()=>{
assert.equal((await call('POST',{joinCode:'test-code',base:'https://outro.example/api',action:'list'})).status,422);
let r=await call('POST',{joinCode:'test-code',base:'https://connect.craft.do/link/personal/api/v1',key:'test-private-key',page:'11111111-1111-1111-1111-111111111111'});assert.equal(r.body.connected,true);assert.ok(r.headers['Set-Cookie'].includes('HttpOnly'));assert.ok(!r.headers['Set-Cookie'].includes('test-private-key'));const cookie=r.headers['Set-Cookie'].split(';')[0];
const body={joinCode:'test-code',name:'Estudante de teste',week:24,uid:'canon-test-01',title:'Título',text:'Primeira observação'};
assert.equal((await call('PUT',body,cookie)).body.saved,true);assert.equal((await call('PUT',{...body,text:'Observação editada'},cookie)).body.saved,true);assert.equal(notes.length,1);assert.ok(notes[0].markdown.includes('Observação editada'));
assert.equal((await call('GET',null,cookie)).body.connected,true);assert.equal((await call('DELETE',null,cookie)).body.disconnected,true);
});
