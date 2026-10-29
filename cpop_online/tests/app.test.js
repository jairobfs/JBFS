'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const content=require('../api/_content');const submit=require('../api/submit');const results=require('../api/results');const health=require('../api/health');
const ENV={CRAFT_API_BASE:'https://connect.craft.do/link/test-connection/api/v1',CRAFT_COLLECTION_ID:'a129558e-4d81-0531-8b07-acf4c126cc7c',CPOP_CLASS_CODE:'turma-teste-24',CPOP_TEACHER_KEY:'chave-educador-exemplo-123456789'};
const saved=[];
const originalFetch=global.fetch;
function fakeFetch(url,options={}){
  const method=options.method||'GET';
  if(url.endsWith('/connection'))return Promise.resolve({ok:true,status:200,text:async()=>JSON.stringify({space:{name:'CP֍P'}})});
  if(url.includes('/collections/')&&method==='GET')return Promise.resolve({ok:true,status:200,text:async()=>JSON.stringify({items:saved})});
  if(url.includes('/collections/')&&method==='POST'){
    const item=JSON.parse(options.body).items[0];saved.push({id:'id-'+saved.length,properties:item.properties});
    return Promise.resolve({ok:true,status:200,text:async()=>JSON.stringify({items:[item]})});
  }
  throw new Error('Unmocked URL');
}
function call(handler,{method='GET',body,authorization}={}){
  return new Promise((resolve,reject)=>{
    const req={method,body,headers:{...(authorization?{authorization}:{})}};
    const res={statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v},end(x){try{resolve({status:this.statusCode,body:JSON.parse(x)})}catch(e){reject(e)}}};
    Promise.resolve(handler(req,res)).catch(reject);
  });
}
test.before(()=>{Object.assign(process.env,ENV);global.fetch=fakeFetch});
test.after(()=>{global.fetch=originalFetch;for(const k of Object.keys(ENV))delete process.env[k]});
test('catálogo público nunca expõe gabaritos nem justificativas',()=>{
  const publicData=content.publicCatalog();assert.equal(publicData.activities.length,3);
  assert.deepEqual(publicData.activities.map(a=>a.questions.length),[8,12,4]);
  for(const a of publicData.activities)for(const q of a.questions){assert.equal('answer' in q,false);assert.equal('why' in q,false)}
});
test('Craft responde à verificação de conexão',async()=>{const r=await call(health);assert.equal(r.body.ready,true)});
test('recusa código de turma errado sem gravar',async()=>{
  const a=content.activities[2];const r=await call(submit,{method:'POST',body:{activityId:a.id,alias:'Estudante X',group:'7A',studentId:'student-123456789',submissionId:'submission-12345',joinCode:'incorreto',answers:a.questions.map(q=>({id:q.id,value:q.answer,evidence:'Esta é uma evidência textual.'}))}});
  assert.equal(r.status,403);assert.equal(saved.length,0);
});
test('grava a tentativa real no formato da coleção e devolve código',async()=>{
  const a=content.activities[2];const body={activityId:a.id,alias:'Estudante X',group:'7A',studentId:'student-123456789',submissionId:'submission-12345',joinCode:'turma-teste-24',elapsedSeconds:324,answers:a.questions.map(q=>({id:q.id,value:q.answer,evidence:'A situação descrita sustenta a conclusão.'}))};
  let r=await call(submit,{method:'POST',body});assert.equal(r.status,200);assert.equal(r.body.saved,true);assert.equal(r.body.unlock,'2413');assert.equal(r.body.points,500);assert.equal(saved.length,1);
  assert.equal(saved[0].properties.alunoid,'student-123456789');assert.equal(saved[0].properties.semana,26);assert.equal(JSON.parse(saved[0].properties.respostasjson).length,4);
  r=await call(submit,{method:'POST',body});assert.equal(r.body.duplicate,true);assert.equal(saved.length,1);
});
test('resultado do professor exige chave e retorna tentativas',async()=>{
  let r=await call(results);assert.equal(r.status,401);
  r=await call(results,{authorization:'Bearer '+ENV.CPOP_TEACHER_KEY});assert.equal(r.status,200);assert.equal(r.body.totals.students,1);assert.equal(r.body.totals.attempts,1);
});
