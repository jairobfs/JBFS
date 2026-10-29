'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
process.env.CRAFT_API_BASE='https://connect.craft.do/link/test/api/v1';process.env.CRAFT_API_KEY='test-key';process.env.CRAFT_COLLECTION_ID='a129558e-4d81-0531-8b07-acf4c126cc7c';process.env.CRAFT_CONTENT_COLLECTION_ID='c3e544ba-2939-2292-45ce-327664a06d9a';process.env.CPOP_CLASS_CODE='jbfs';process.env.CPOP_TEACHER_KEY='test-teacher-123456789';
const {hash}=require('../api/_access');let access=[{id:'access-1',properties:{pinhash:hash(process.env.CPOP_TEACHER_KEY),codehash:hash('jbfs')}}];
const people=require('../api/people'),admin=require('../api/lesson-admin'),lesson=require('../api/lesson');
let names=[{id:'p1',nome:'Pessoa Teste',properties:{ativo:true}}],rows=[],writes=0;
const originalFetch=global.fetch;
global.fetch=async(url,opts={})=>{const roster=url.includes('c7cf9221'),data=url.includes('5ce6423e')?access:roster?names:rows;if(opts.method==='POST'){writes++;for(const x of JSON.parse(opts.body).items)data.push({id:'item-'+data.length,...x});}if(opts.method==='PUT'){writes++;for(const x of JSON.parse(opts.body).itemsToUpdate){const r=data.find(y=>y.id===x.id);if(x.nome)r.nome=x.nome;Object.assign(r.properties,x.properties);}}return {ok:true,text:async()=>JSON.stringify({items:data})};};
const call=async(handler,method='GET',body,auth=false)=>new Promise((resolve,reject)=>{handler({method,body,headers:auth?{authorization:'Bearer '+process.env.CPOP_TEACHER_KEY}:{}},{setHeader(){},statusCode:200,end(x){resolve({status:this.statusCode,body:JSON.parse(x)})}}).catch(reject);});
test.after(()=>global.fetch=originalFetch);
test('lista exige código e permite adicionar, renomear e retirar preservando o registro',async()=>{
 assert.equal((await call(people)).status,403);assert.equal((await call(people,'POST',{joinCode:'errado'})).status,403);
 let r=await call(people,'GET',null,true);assert.equal(r.body.items[0].name,'Pessoa Teste');
 assert.equal((await call(people,'PUT',{name:'Pessoa Nova',revision:r.body.revision},true)).body.saved,true);
 r=await call(people,'GET',null,true);const rev=r.body.revision;
 assert.equal((await call(people,'PUT',{id:'p1',name:'Pessoa Corrigida',active:false,revision:rev},true)).body.saved,true);
 assert.equal((await call(people,'PUT',{name:'Outra Pessoa',revision:rev},true)).status,409);
 r=await call(people,'POST',{joinCode:'jbfs'});assert.deepEqual(r.body.items.map(x=>x.name),['Pessoa Nova']);assert.equal(names.length,2);
});
test('criar e retirar questão atualiza a aula, oculta gabarito e recusa revisão concorrente',async()=>{
 const item={uid:'questao-real-teste',week:24,order:10,type:'questao',title:'Questão',body:'Estímulo completo',options:['A','B','C','D','E'],answer:5,why:'Evidência e mecanismo.',active:true};
 assert.equal((await call(admin,'POST',{item})).status,401);
 assert.equal((await call(admin,'POST',{item},true)).body.created,true);
 let r=await call(lesson);assert.equal(r.body.weeks[0].entries[0].options.length,5);assert.equal('answer' in r.body.weeks[0].entries[0],false);
 r=await call(admin,'GET',null,true);const q=r.body.items[0];
 assert.equal((await call(admin,'PUT',{id:q.id,revision:'obsoleto',item:{...q,active:false}},true)).status,409);
 assert.equal((await call(admin,'PUT',{id:q.id,revision:q.revision,item:{...q,active:false}},true)).body.saved,true);
 r=await call(lesson);assert.equal(r.body.weeks[0].entries.length,0);assert.equal(rows.length,1);
});

test('troca de PIN e código invalida os anteriores e confirma os novos sem expor hashes',async()=>{const settings=require('../api/_settings'),{teacher,classAccess}=require('../api/_http');let r=await call(settings,'PUT',{pin:'9876',code:'nova-turma'},true);assert.equal(r.body.saved,true);assert.equal(await teacher({headers:{authorization:'Bearer '+process.env.CPOP_TEACHER_KEY}}),false);assert.equal(await teacher({headers:{authorization:'Bearer 9876'}}),true);assert.equal(await classAccess('jbfs'),false);assert.equal(await classAccess('nova-turma'),true);assert.equal('pinhash' in r.body,false);});
