'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
process.env.CRAFT_API_KEY='test-server-encryption-key';
process.env.CRAFT_API_BASE='https://connect.craft.do/link/server/api/v1';
process.env.CRAFT_COLLECTION_ID='a129558e-4d81-0531-8b07-acf4c126cc7c';
const {hash}=require('../api/_access'),handler=require('../api/_notebook'),codehash=hash('test-code');
const PAGE='11111111-1111-1111-1111-111111111111',SPACE='22222222-2222-2222-2222-222222222222';
let notes=[],documents=[{id:PAGE,title:'Meu caderno'}];const original=global.fetch;
global.fetch=async(url,o={})=>{
 const method=o.method||'GET';let result={};
 if(url.includes('/collections/5ce6423e'))result={items:[{id:'config',properties:{codehash}}]};
 else if(url.endsWith('/connection'))result={space:{id:SPACE}};
 else if(url.endsWith('/documents')){
  if(method==='POST'){const d=JSON.parse(o.body).documents[0];documents.push({id:PAGE,title:d.title});result={items:[{id:PAGE,title:d.title}]};}
  else result={items:documents};
 }else if(url.includes('/blocks?id='))result={data:notes};
 else if(url.endsWith('/blocks')&&method==='POST'){
  const body=JSON.parse(o.body);
  if(body.markdown){notes.push({id:'note-'+notes.length,markdown:body.markdown});}
  result={items:notes};
 }else if(url.endsWith('/blocks')&&method==='PUT'){
  const block=JSON.parse(o.body).blocks[0];const existing=notes.find(n=>n.id===block.id);
  if(existing)existing.markdown=block.markdown;result={items:notes};
 }
 return {ok:true,json:async()=>result,text:async()=>JSON.stringify(result)};
};
const call=(method,body,cookie='')=>new Promise((resolve,reject)=>{const headers={};handler({method,body,headers:{cookie}},{setHeader(k,v){headers[k]=v},statusCode:200,end(x){resolve({status:this.statusCode,body:JSON.parse(x),headers})}}).catch(reject)});
const profile={joinCode:'test-code',name:'Estudante de teste',studentId:'student-test-123456',week:24};
test.after(()=>global.fetch=original);
test('protege a URL e mantém chave pessoal cifrada em cookie HttpOnly',async()=>{
 assert.equal((await call('POST',{...profile,base:'https://outro.example/api',action:'list'})).status,422);
 const r=await call('POST',{...profile,base:'https://connect.craft.do/link/personal/api/v1',key:'test-private-key',page:PAGE,action:'connect'});
 assert.equal(r.body.connected,true);
 assert.match(r.headers['Set-Cookie'],/HttpOnly/);
 assert.ok(!r.headers['Set-Cookie'].includes('test-private-key'));
 assert.match(r.body.pageLink,/docs\.craft\.do\/editor/);
 const cookie=r.headers['Set-Cookie'].split(';')[0];
 const body={...profile,uid:'canon-test-01',title:'Título',text:'Primeira observação'};
 assert.equal((await call('PUT',body,cookie)).body.saved,true);
 assert.equal((await call('PUT',{...body,text:'Observação editada'},cookie)).body.saved,true);
 assert.equal(notes.filter(x=>x.markdown.startsWith('**Estudante')).length,1);
 assert.ok(notes.some(n=>n.markdown.includes('Observação editada')));
 const pulled=await call('POST',{...profile,action:'pull',entries:[{uid:body.uid,title:body.title}]},cookie);
 assert.equal(pulled.body.notes[0].text,'Observação editada');
 assert.equal((await call('PUT',{...body,studentId:'another-student-12345'},cookie)).status,403);
 assert.equal((await call('GET',null,cookie)).body.connected,true);
 assert.equal((await call('DELETE',null,cookie)).body.disconnected,true);
});
test('cria uma nota por pessoa e permite continuar escrevendo em outras semanas',async()=>{
 notes=[];
 const r=await call('POST',{...profile,base:'https://connect.craft.do/link/personal/api/v1',action:'create'});
 assert.equal(r.body.created,true);
 const cookie=r.headers['Set-Cookie'].split(';')[0];
 const result=await call('PUT',{...profile,week:25,uid:'canon-test-02',title:'Segundo tema',text:'Conceito interdisciplinar'},cookie);
 assert.equal(result.body.saved,true);
 assert.ok(documents.some(x=>x.title.includes('Caderno de Linguagens')));
 assert.ok(notes.some(x=>x.markdown.includes('Conceito interdisciplinar')));
});
