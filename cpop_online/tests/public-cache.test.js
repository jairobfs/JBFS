'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {send}=require('../api/_http');
function response(){
 const headers={};
 return {headers,setHeader:(key,value)=>{headers[key.toLowerCase()]=value;},end(value){this.body=JSON.parse(value);}};
}
test('only explicit successful public responses are cached',()=>{
 const publicRes=response();send(publicRes,200,{weeks:[]},{ttl:20,stale:120});
 assert.match(publicRes.headers['cache-control'],/public, s-maxage=20, stale-while-revalidate=120/);
 const privateRes=response();send(privateRes,200,{secret:'private'});
 assert.equal(privateRes.headers['cache-control'],'no-store');
 const errorRes=response();send(errorRes,503,{error:'Craft offline'},{ttl:20,stale:120});
 assert.equal(errorRes.headers['cache-control'],'no-store');
});
test('public Craft reads coalesce, reuse snapshots and survive a temporary 429',async()=>{
 const path=require.resolve('../api/_craft');
 const original=require(path).request;
 const previousCollection=process.env.CRAFT_CONTENT_COLLECTION_ID;
 const originalNow=Date.now;
 let now=2000000,calls=0,fail=false;
 Date.now=()=>now;
 process.env.CRAFT_CONTENT_COLLECTION_ID='00000000-0000-0000-0000-000000000001';
 require(path).request=async()=>{calls++;if(fail)throw Object.assign(new Error('Craft limit'),{status:429,code:'CRAFT_HTTP'});
  return {items:[{id:'record',properties:{uid:'s24-slide-test',semana:24,ordem:1,tipo:'slide',titulo:'Teoria',corpo:'Evidência',ativo:true,pontos:0}}]};
 };
 const lessonPath=require.resolve('../api/_lesson');
 delete require.cache[lessonPath];
 try{
  const {loadPublicContent}=require('../api/_lesson');
  const results=await Promise.all([loadPublicContent(),loadPublicContent(),loadPublicContent()]);
  assert.equal(calls,1);
  assert.equal(results[0][0].title,'Teoria');
  now+=5000;await loadPublicContent();assert.equal(calls,1);
  now+=16000;fail=true;
  const stale=await loadPublicContent();assert.equal(stale[0].title,'Teoria');assert.equal(calls,2);
  fail=false;now+=1000;await loadPublicContent();assert.equal(calls,3);
 }finally{
  Date.now=originalNow;require(path).request=original;
  if(previousCollection===undefined)delete process.env.CRAFT_CONTENT_COLLECTION_ID;
  else process.env.CRAFT_CONTENT_COLLECTION_ID=previousCollection;
  delete require.cache[lessonPath];
 }
});

test('a Craft edit invalidates a cached read even when an older request is pending',async()=>{
 const craftPath=require.resolve('../api/_craft');
 const lessonPath=require.resolve('../api/_lesson');
 const original=require(craftPath).request;
 const previous=process.env.CRAFT_CONTENT_COLLECTION_ID;
 process.env.CRAFT_CONTENT_COLLECTION_ID='00000000-0000-0000-0000-000000000001';
 let resolveOld,reads=0;
 const props=title=>({uid:'s24-slide-test',semana:24,ordem:1,tipo:'slide',titulo:title,corpo:'Conteúdo',ativo:true,pontos:0});
 require(craftPath).request=async(_path,method='GET')=>{
  if(method==='POST')return {saved:true};
  reads++;
  if(reads===1)return new Promise(resolve=>{resolveOld=resolve});
  return {items:[{id:'record',properties:props('Novo conteúdo')}]};
 };
 delete require.cache[lessonPath];
 try{
  const {loadPublicContent,createItem}=require('../api/_lesson');
  const oldRead=loadPublicContent();
  await createItem({bloco:'Teste',properties:props('Novo conteúdo')});
  resolveOld({items:[{id:'record',properties:props('Conteúdo anterior')}]});
  assert.equal((await oldRead)[0].title,'Conteúdo anterior');
  const fresh=await loadPublicContent();
  assert.equal(fresh[0].title,'Novo conteúdo');
  assert.equal(reads,2);
 }finally{
  require(craftPath).request=original;
  if(previous===undefined)delete process.env.CRAFT_CONTENT_COLLECTION_ID;
  else process.env.CRAFT_CONTENT_COLLECTION_ID=previous;
  delete require.cache[lessonPath];
 }
});
