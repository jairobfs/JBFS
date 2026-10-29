'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const ENV={CRAFT_API_BASE:'https://connect.craft.do/link/test-connection/api/v1',CRAFT_API_KEY:'test-application-key',CRAFT_COLLECTION_ID:'a129558e-4d81-0531-8b07-acf4c126cc7c',CRAFT_CONTENT_COLLECTION_ID:'c3e544ba-2939-2292-45ce-327664a06d9a'};
Object.assign(process.env,ENV);
const {hash}=require('../api/_access'),submit=require('../api/submit'),results=require('../api/results'),health=require('../api/health'),lesson=require('../api/lesson');
const ACCESS=[{id:'config-1',properties:{codehash:hash('jbfs'),pinhash:hash('1844')}}];
const CONTENT=[1,2].map(i=>({id:'item-'+i,properties:{uid:'c26-teste-'+i,semana:26,ordem:i,tipo:'questao',titulo:'Inferência '+i,corpo:'Qual inferência é correta na cena '+i+'?',opcoes:JSON.stringify(['Alternativa correta','Distrator']),gabarito:1,justificativa:'A pista contextual identifica a alternativa correta.',ativo:true}}));
const attempts=[],original=global.fetch;
global.fetch=async(url,opt={})=>{const method=opt.method||'GET';let result={};
 assert.equal(opt.headers?.Authorization,'Bearer '+ENV.CRAFT_API_KEY);
 if(url.endsWith('/connection'))result={space:{name:'CPOP'}};
 else if(url.includes('5ce6423e-2313-51d9-0793-34692d233223'))result={items:ACCESS};
 else if(url.includes(ENV.CRAFT_CONTENT_COLLECTION_ID))result={items:CONTENT};
 else if(url.includes(ENV.CRAFT_COLLECTION_ID)){
  if(method==='POST'){const v=JSON.parse(opt.body).items[0];attempts.push({id:'attempt-'+attempts.length,...v});result={items:[v]};}
  else result={items:attempts};
 }
 else throw Error('Unexpected mocked URL: '+url);
 return {ok:true,status:200,text:async()=>JSON.stringify(result)};
};
function call(handler,{method='GET',body,authorization}={}){return new Promise((resolve,reject)=>{const req={method,body,headers:{...(authorization?{authorization}:{})}},res={statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v},end(x){resolve({status:this.statusCode,body:JSON.parse(x)})}};Promise.resolve(handler(req,res)).catch(reject)})}
test.after(()=>{global.fetch=original;for(const name of Object.keys(ENV))delete process.env[name]});
test('API Craft disponível e conteúdo sem gabarito público',async()=>{
 const status=await call(health);assert.equal(status.body.ready,true);
 const l=await call(lesson);assert.equal(l.status,200);
 const q=l.body.weeks.find(x=>x.week===26).entries.find(e=>e.type==='questao');
 assert.equal('answer' in q,false);
});
test('identificação e código de turma são validados antes de registrar',async()=>{
 const invalid=await call(submit,{method:'POST',body:{activityId:'not-a-real-game',joinCode:'errado'}});
 assert.notEqual(invalid.status,200);assert.equal(attempts.length,0);
});
test('aluno envia, recebe correção e tem tentativa idempotente',async()=>{
 const l=await call(lesson),version=l.body.version;
 const {buildActivities,loadContent}=require('../api/_lesson');const a=buildActivities(await loadContent()).find(x=>x.week===26);
 const payload={activityId:a.id,catalogVersion:version,name:'Estudante CPOP Teste',alias:'Teste',group:'CPOP - Campo Mourão',studentId:'student-123456789',submissionId:'submission-123456',joinCode:'jbfs',elapsedSeconds:100,answers:a.questions.map(q=>({id:q.id,value:q.answer,evidence:'A pista visual e o contexto apoiam a conclusão.'}))};
 let r=await call(submit,{method:'POST',body:payload});
 assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.saved,true);assert.equal(r.body.unlock,'2413');assert.equal(r.body.points,300);assert.equal(attempts.length,1);
 r=await call(submit,{method:'POST',body:payload});assert.equal(r.body.duplicate,true);assert.equal(attempts.length,1);
});
test('o painel docente usa PIN e reúne os dados na própria página',async()=>{
 assert.equal((await call(results)).status,401);
 const r=await call(results,{authorization:'Bearer 1844'});assert.equal(r.status,200);assert.equal(r.body.totals.students,1);assert.equal(r.body.totals.attempts,1);
});
