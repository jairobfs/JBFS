'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');

const IDS=['canon-vest-02','canon-vest-01','canon-vest-11','canon-vest-04','canon-vest-06','canon-vest-29','canon-vest-23','canon-vest-03','canon-q296','canon-q251','canon-q252','canon-q260','canon-q264','canon-q265','canon-q255','recent-20261029-variacao','recent-20261029-meta','recent-20261029-trem','recent-20261029-arte','recent-20261029-embora','recent-20261029-pretugues','recent-20261029-guarani','recent-20261029-slam'];
const collections={
 content:'c3e544ba-2939-2292-45ce-327664a06d9a',
 answers:'675a73a0-b3c2-6a26-4613-0cc6dac7a844',
 stage:'117e4c16-84fb-040f-3300-2952f55ebf55',
 access:'5ce6423e-2313-51d9-0793-34692d233223'
};
Object.assign(process.env,{
 CRAFT_API_BASE:'https://connect.craft.do/link/mock-mini/api/v1',
 CRAFT_API_KEY:'test-application-key',
 CRAFT_COLLECTION_ID:'a129558e-4d81-0531-8b07-acf4c126cc7c',
 CRAFT_CONTENT_COLLECTION_ID:collections.content
});
const {hash}=require('../api/_access');
const handler=require('../mini_backend');
const content=IDS.map((uid,i)=>({
 id:'item-'+(i+1),
 properties:{uid,semana:[24,25,26][i%3],ordem:10+i,tipo:'questao',titulo:'Questão canônica '+(i+1),
 corpo:'Enunciado de teste '+(i+1),opcoes:JSON.stringify(['Opção A','Opção B','Opção C','Opção D','Opção E']),
 gabarito:i%5+1,justificativa:'Justificativa técnica '+i,ativo:true,pontos:100}
}));
const stage={id:'stage-one',properties:{atividade:'mini-linguagens-2026-11',questao:1,ativo:false,revelar:false,atualizado:'2026-11-03T00:00:00Z'}};
const rows=[],auth={id:'config-one',properties:{pinhash:hash('1844'),codehash:hash('jbfs')}};
const originalFetch=global.fetch;
global.fetch=async(url,options={})=>{
 const method=options.method||'GET';
 const body=options.body?JSON.parse(options.body):{};
 let result={};
 if(String(url).endsWith('/connection'))result={space:{name:'CPOP'}};
 else if(String(url).includes(collections.access))result={items:[auth]};
 else if(String(url).includes(collections.content))result={items:content};
 else if(String(url).includes(collections.stage)){
  if(method==='PUT')Object.assign(stage.properties,body.itemsToUpdate[0].properties);
  result={items:[stage]};
 }else if(String(url).includes(collections.answers)){
  if(method==='GET')result={items:rows};
  if(method==='POST'){const item=body.items[0];const row={id:'answer-'+(rows.length+1),properties:item.properties};rows.push(row);result={items:[row]};}
  if(method==='PUT'){const patch=body.itemsToUpdate[0],row=rows.find(x=>x.id===patch.id);if(!row)throw Error('Test row not found');Object.assign(row.properties,patch.properties);result={items:[row]};}
 }else throw Error('Unsupported Craft request: '+method+' '+url);
 return {ok:true,status:200,text:async()=>JSON.stringify(result)};
};
test.after(()=>{global.fetch=originalFetch});
function call(method,url,body,token){
 const req={method,url,body,headers:token?{authorization:'Bearer '+token}:{}};
 return new Promise((resolve,reject)=>{
  const res={statusCode:200,setHeader(){},end(text){try{resolve({status:this.statusCode,body:JSON.parse(text)})}catch(e){reject(e)}}};
  Promise.resolve(handler(req,res)).catch(reject);
 });
}
test('mini-simulado Craft: aluno, texto livre, docente, projeção e devolutiva',async()=>{
 let r=await call('GET','/api/lesson?mini=1&mode=student');
 assert.equal(r.status,200);
 assert.equal(r.body.questions.length,IDS.length);
 assert.ok(r.body.questions.every(q=>!('answer' in q)&&!('why' in q)));
 const version=r.body.version;
 r=await call('GET','/api/lesson?mini=1&mode=teacher');
 assert.equal(r.status,401);
 const answers=IDS.map((id,i)=>({id,choice:i===0?0:i%5+1,comment:i===0?'Resposta discursiva de teste, com evidência textual.':''}));
 const base={name:'VALIDACAO TESTE AUTOMATIZADO',studentId:'test-student-minisimulado',group:'CPOP - Campo Mourão',code:'jbfs',version,answers};
 r=await call('POST','/api/lesson?mini=1',{...base,code:'errado',final:false});
 assert.equal(r.status,403);
 r=await call('POST','/api/lesson?mini=1',{...base,final:false});
 assert.equal(r.status,200);assert.equal(r.body.saved,true);assert.equal(rows.length,1);
 answers[1].comment='Comentário complementar antes de finalizar.';
 r=await call('POST','/api/lesson?mini=1',{...base,answers,final:false});
 assert.equal(r.status,200);assert.equal(rows.length,1);
 r=await call('POST','/api/lesson?mini=1',{...base,answers,final:true});
 assert.equal(r.status,200);assert.equal(r.body.correct,IDS.length-1);assert.equal(r.body.commentsOnly,1);
 r=await call('POST','/api/lesson?mini=1',{...base,answers,final:true});
 assert.equal(r.status,409);assert.equal(rows.length,1);
 r=await call('GET','/api/lesson?mini=1&mode=teacher',null,'1844');
 assert.equal(r.status,200);assert.equal(r.body.records[0].final,true);
 assert.equal(r.body.records[0].answers[0].comment,answers[0].comment);
 // Um registro antigo do Craft fora da ordem não deve alterar sua atribuição à questão.
 const old=JSON.parse(rows[0].properties.respostas);rows[0].properties.respostas=JSON.stringify([...old].reverse());
 r=await call('GET','/api/lesson?mini=1&mode=teacher',null,'1844');
 assert.equal(r.status,200);assert.equal(r.body.records[0].answers[0].id,IDS[0]);
 r=await call('POST','/api/lesson?mini=1',{action:'feedback',rowId:rows[0].id,questionId:IDS[0],comment:'Sua inferência está sustentada pelo texto.'},'1844');
 assert.equal(r.status,200);
 r=await call('GET','/api/lesson?mini=1&mode=student&studentId=test-student-minisimulado&code=jbfs');
 assert.equal(r.body.progress.final,true);
 assert.equal(r.body.progress.feedback[IDS[0]],'Sua inferência está sustentada pelo texto.');
 assert.equal(r.body.progress.savedVersion,version);
 r=await call('GET','/api/lesson?mini=1&mode=projection');
 assert.equal(r.body.answer,null);
 r=await call('PUT','/api/lesson?mini=1',{number:2,active:true,reveal:true},'1844');
 assert.equal(r.status,200);
 r=await call('GET','/api/lesson?mini=1&mode=projection');
 assert.equal(r.status,200);assert.equal(r.body.question.id,IDS[1]);assert.equal(r.body.answer,2);
 assert.equal(r.body.distribution.started,1);assert.equal(r.body.distribution.submitted,1);
 // Somente o professor pode publicar e remover uma justificativa no telão.
 r=await call('POST','/api/lesson?mini=1',{action:'project-comment',show:true,rowId:rows[0].id,questionId:IDS[0],text:'Trecho escolhido pelo professor para discussão, sem dados pessoais.'});
 assert.equal(r.status,401);
 r=await call('POST','/api/lesson?mini=1',{action:'project-comment',show:true,rowId:rows[0].id,questionId:IDS[0],text:'Trecho escolhido pelo professor para discussão, sem dados pessoais.'},'1844');
 assert.equal(r.status,200);
 assert.equal(r.body.stage.number,1);
 assert.equal(r.body.stage.reveal,false);
 assert.equal(r.body.stage.projectedComment,'Trecho escolhido pelo professor para discussão, sem dados pessoais.');
 r=await call('GET','/api/lesson?mini=1&mode=projection');
 assert.equal(r.status,200);
 assert.equal(r.body.projectedComment,'Trecho escolhido pelo professor para discussão, sem dados pessoais.');
 assert.ok(!JSON.stringify(r.body).includes('VALIDACAO TESTE AUTOMATIZADO'));
 r=await call('GET','/api/lesson?mini=1&mode=student');
 assert.equal(r.status,200);
 assert.ok(!JSON.stringify(r.body.stage).includes('Trecho escolhido pelo professor'));
 r=await call('POST','/api/lesson?mini=1',{action:'project-comment',show:false},'1844');
 assert.equal(r.status,200);
 r=await call('GET','/api/lesson?mini=1&mode=projection');
 assert.equal(r.body.projectedComment,'');
 r=await call('POST','/api/lesson?mini=1',{action:'project-comment',show:true,rowId:rows[0].id,questionId:IDS[0],text:'Comentário para ocultar automaticamente na mudança de etapa.'},'1844');
 assert.equal(r.status,200);
 r=await call('PUT','/api/lesson?mini=1',{number:2,active:true,reveal:false},'1844');
 assert.equal(r.status,200);
 r=await call('GET','/api/lesson?mini=1&mode=projection');
 assert.equal(r.body.projectedComment,'');
});
