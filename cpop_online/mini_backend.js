'use strict';
const {loadContent,fingerprint,publishedMedia}=require('./api/_lesson');
const {request,itemsOf}=require('./api/_craft');
const {send,method,parseBody,teacher,classAccess,str}=require('./api/_http');
const RESPONSES='675a73a0-b3c2-6a26-4613-0cc6dac7a844';
const PRESENTATION='117e4c16-84fb-040f-3300-2952f55ebf55';
const ACTIVITY='mini-linguagens-2026-11';
const IDS=['canon-vest-02','canon-vest-01','canon-vest-11','canon-vest-04','canon-vest-06','canon-vest-29','canon-vest-23','canon-vest-03','canon-q296','canon-q251','canon-q252','canon-q260','canon-q264','canon-q265','canon-q255','recent-20261029-variacao','recent-20261029-meta','recent-20261029-trem','recent-20261029-arte','recent-20261029-embora','recent-20261029-pretugues','recent-20261029-guarani','recent-20261029-slam'];

function qPublic(q,i){return {id:q.uid,number:i+1,title:q.title,body:q.body,image:publishedMedia(q.image),alt:q.alt,source:q.source,options:q.options};}
async function bank(){
 const all=await loadContent(),questions=IDS.map(id=>all.find(x=>x.uid===id&&x.active&&x.type==='questao'));
 if(questions.some(x=>!x))throw Error('Há questões da seleção que não estão publicadas no Craft.');
 return {questions,version:'mini-'+fingerprint(questions)};
}
async function getRows(){return itemsOf(await request('/collections/'+RESPONSES+'/items?maxDepth=0'));}
async function getStage(){
 const rows=itemsOf(await request('/collections/'+PRESENTATION+'/items?maxDepth=0'));
 const row=rows.find(x=>x.properties?.atividade===ACTIVITY);
 if(!row)throw Error('Sessão de projeção não encontrada.');
 const p=row.properties||{};
 return {row:row.id,number:Math.min(IDS.length,Math.max(1,Number(p.questao)||1)),active:p.ativo===true,reveal:p.revelar===true,updated:String(p.atualizado||''),projectedComment:String(p.comentarioprojetado||'').slice(0,700),timerDuration:p.cronoduracao,timerRemaining:p.cronorestante,timerUntil:String(p.cronofim||'')};
}

function timerOf(stage, now=Date.now()){
 const configured=Number(stage.timerDuration);
 const duration=Number.isFinite(configured)&&configured>=15&&configured<=900?Math.floor(configured):120;
 const saved=Number(stage.timerRemaining);
 const remainingStored=stage.timerRemaining!==null&&stage.timerRemaining!==undefined&&stage.timerRemaining!==''&&Number.isFinite(saved)?Math.max(0,Math.min(duration,Math.floor(saved))):duration;
 const deadlineMs=Date.parse(stage.timerUntil||'');
 const hasDeadline=stage.timerUntil&&Number.isFinite(deadlineMs);
 const remaining=hasDeadline?Math.min(duration,Math.max(0,Math.ceil((deadlineMs-now)/1000))):remainingStored;
 const running=Boolean(stage.active&&!stage.reveal&&hasDeadline&&remaining>0);
 return {duration,remaining,running,deadline:running?stage.timerUntil:null,serverTime:new Date(now).toISOString()};
}
function snapshot(stage,now=Date.now()){
 return {number:stage.number,active:stage.active,reveal:stage.reveal,updated:stage.updated,projectedComment:stage.projectedComment,clock:timerOf(stage,now)};
}
function safeParse(raw,fallback){try{const p=JSON.parse(raw||'');return p&&typeof p==='object'?p:fallback}catch{return fallback}}
function normalizeAnswers(raw,qs){
 const by=new Map();if(!Array.isArray(raw)||raw.length>qs.length)return null;
 for(const v of raw){if(!v||typeof v.id!=='string'||by.has(v.id))return null;by.set(v.id,v);}
 if([...by.keys()].some(id=>!qs.some(q=>q.uid===id)))return null;
 return qs.map(q=>{
   const r=by.get(q.uid)||{},value=Number(r.choice)||0,comment=typeof r.comment==='string'?r.comment.trim():'';
   if(!Number.isInteger(value)||value<0||value>q.options.length||comment.length>750)return null;
   return {id:q.uid,choice:value,comment};
 });
}
function scoreOf(answers,qs){
 let correct=0,answered=0,commentsOnly=0;
 for(let i=0;i<qs.length;i++){
  const a=answers[i]||{};
  if(a.choice){answered++;if(a.choice===qs[i].answer)correct++;}
  else if(a.comment?.length>=8)commentsOnly++;
 }
 return {correct,answered,commentsOnly,total:qs.length,missing:qs.length-answered-commentsOnly};
}
function rowPublic(row,qs){
 const p=row.properties||{},raw=safeParse(p.respostas,[]);
 const byId=new Map((Array.isArray(raw)?raw:[]).filter(x=>x&&typeof x.id==='string').map(x=>[x.id,x]));
 const answers=qs.map(q=>{const a=byId.get(q.uid)||{};return {id:q.uid,choice:Number.isInteger(a.choice)&&a.choice>=1&&a.choice<=q.options.length?a.choice:0,comment:typeof a.comment==='string'?a.comment.slice(0,750):''};});
 const scored=scoreOf(answers,qs);
 return {id:row.id,studentId:String(p.alunoid||''),name:String(p.nome||''),group:p.turma||'',answers,final:p.finalizado===true,updated:p.atualizacao||'',savedVersion:String(p.versao||''),feedback:safeParse(p.devolutivas,{}),...scored};
}
function studentOutput(row,qs){
 const d=rowPublic(row,qs);
 return {saved:true,answers:d.answers,final:d.final,updated:d.updated,savedVersion:d.savedVersion,feedback:d.feedback,correct:d.final?d.correct:null,answered:d.answered,commentsOnly:d.commentsOnly};
}
function query(req){const u=new URL(req.url||'/', 'https://cpop.local');return {mode:String(req.query?.mode||u.searchParams.get('mode')||'student'),studentId:String(req.query?.studentId||u.searchParams.get('studentId')||''),code:String(req.query?.code||u.searchParams.get('code')||'')};}
function distrib(q,rows,idx){
 const counts=q.options.map(()=>0),comments=[];
 for(const r of rows){const a=r.answers[idx];if(!a)continue;if(a.choice>=1&&a.choice<=counts.length)counts[a.choice-1]++;if(a.comment)comments.push({name:r.name,text:a.comment});}
 return {counts,submitted:rows.filter(r=>r.final).length,started:rows.length,comments:comments.length};
}

module.exports=async(req,res)=>{
 if(!method(req,res,['GET','POST','PUT']))return;
 try{
 const {questions,version}=await bank();
 if(req.method==='GET'){
  const info=query(req),stage=await getStage();
  if(info.mode==='teacher'){
   if(!await teacher(req)){send(res,401,{error:'Acesso reservado ao educador.'});return;}
   const records=(await getRows()).filter(r=>r.properties?.atividade===ACTIVITY).map(r=>rowPublic(r,questions));
   send(res,200,{activity:ACTIVITY,version,questions:questions.map((q,i)=>({...qPublic(q,i),answer:q.answer,why:q.why})),stage:snapshot(stage),records});return;
  }
  if(info.mode==='projection'){
   const q=questions[stage.number-1];
   const rows=stage.active?(await getRows()).filter(r=>r.properties?.atividade===ACTIVITY).map(r=>rowPublic(r,questions)):[];
   send(res,200,{activity:ACTIVITY,version,total:questions.length,question:qPublic(q,stage.number-1),stage:{...snapshot(stage),projectedComment:undefined},distribution:distrib(q,rows,stage.number-1),projectedComment:stage.active?stage.projectedComment:'',answer:stage.reveal?q.answer:null,why:stage.reveal?q.why:''});return;
  }
  const output={activity:ACTIVITY,version,title:'Revisão final de Linguagens · CPOP',questions:questions.map(qPublic),stage:{number:stage.number,active:stage.active,reveal:stage.reveal,updated:stage.updated,clock:timerOf(stage)}};
  if(info.studentId&&info.code&&await classAccess(info.code)){
   const row=(await getRows()).find(r=>r.properties?.atividade===ACTIVITY&&r.properties?.alunoid===info.studentId);
   if(row)output.progress=studentOutput(row,questions);
  }
  send(res,200,output);return;
 }
 const body=parseBody(req)||{};
 if(req.method==='PUT'){
  if(!await teacher(req)){send(res,401,{error:'Apenas o educador controla a projeção.'});return;}
  const stage=await getStage(),number=Number(body.number);
  if(!Number.isInteger(number)||number<1||number>questions.length){send(res,422,{error:'Questão inválida.'});return;}
  const clock=timerOf(stage),changed=number!==stage.number,active=body.active===true,reveal=body.reveal===true;
  const keepRunning=!changed&&active&&!reveal&&clock.running;
  const remaining=changed?clock.duration:clock.remaining;
  const props={questao:number,ativo:active,revelar:reveal,atualizado:new Date().toISOString(),comentarioprojetado:!changed&&active?stage.projectedComment:'',cronoduracao:clock.duration,cronorestante:remaining,cronofim:keepRunning?stage.timerUntil:''};
  await request('/collections/'+PRESENTATION+'/items','PUT',{itemsToUpdate:[{id:stage.row,properties:props}]});
  send(res,200,{saved:true,stage:snapshot({number,active,reveal,updated:props.atualizado,projectedComment:props.comentarioprojetado,timerDuration:clock.duration,timerRemaining:remaining,timerUntil:props.cronofim})});return;
 }
 if(body.action==='timer'){
  if(!await teacher(req)){send(res,401,{error:'Somente o professor controla o cronômetro.'});return;}
  const stage=await getStage(),clock=timerOf(stage),op=String(body.op||''),now=Date.now();
  let duration=clock.duration,remaining=clock.remaining,until='',active=stage.active,reveal=stage.reveal;
  if(op==='set'){
   duration=Number(body.seconds);
   if(!Number.isInteger(duration)||duration<15||duration>900){send(res,422,{error:'Defina um tempo de 15 segundos a 15 minutos.'});return;}
   remaining=duration;
  }else if(op==='start'){
   remaining=remaining>0?remaining:duration;
   until=new Date(now+remaining*1000).toISOString();
   active=true;reveal=false;
   if(clock.running)until=stage.timerUntil;
  }else if(op==='pause'){
   remaining=clock.remaining;
  }else if(op==='reset'){
   remaining=duration;
  }else{send(res,422,{error:'Comando de cronômetro inválido.'});return;}
  const props={cronoduracao:duration,cronorestante:remaining,cronofim:until,ativo:active,revelar:reveal,atualizado:new Date(now).toISOString()};
  await request('/collections/'+PRESENTATION+'/items','PUT',{itemsToUpdate:[{id:stage.row,properties:props}]});
  send(res,200,{saved:true,stage:snapshot({...stage,active,reveal,timerDuration:duration,timerRemaining:remaining,timerUntil:until,updated:props.atualizado},now)});return;
 }
 if(body.action==='project-comment'){
  if(!await teacher(req)){send(res,401,{error:'Apenas o educador pode projetar comentários.'});return;}
  const stage=await getStage(),show=body.show===true;
  let nextNumber=stage.number,comment='';
  if(show){
   const qid=str(body.questionId,100),rowId=str(body.rowId,100),index=questions.findIndex(q=>q.uid===qid);
   const row=(await getRows()).find(r=>r.id===rowId&&r.properties?.atividade===ACTIVITY);
   if(index<0||!row){send(res,404,{error:'Resposta não encontrada nesta atividade.'});return;}
   const answers=safeParse(row.properties?.respostas,[]);
   const source=Array.isArray(answers)?answers.find(a=>a?.id===qid):null;
   if(!source||typeof source.comment!=='string'||!source.comment.trim()){send(res,422,{error:'Esta questão não possui comentário do estudante.'});return;}
   comment=typeof body.text==='string'?body.text.trim():'';
   if(comment.length<8||comment.length>700){send(res,422,{error:'Revise o trecho: são permitidos de 8 a 700 caracteres.'});return;}
   nextNumber=index+1;
  }
  const updated=new Date().toISOString(),currentClock=timerOf(stage),changed=nextNumber!==stage.number;
  const active=show?true:stage.active,reveal=show?false:stage.reveal;
  const remaining=changed?currentClock.duration:currentClock.remaining,until=!changed&&currentClock.running&&active&&!reveal?stage.timerUntil:'';
  const props={questao:nextNumber,ativo:active,revelar:reveal,comentarioprojetado:comment,atualizado:updated,cronoduracao:currentClock.duration,cronorestante:remaining,cronofim:until};
  await request('/collections/'+PRESENTATION+'/items','PUT',{itemsToUpdate:[{id:stage.row,properties:props}]});
  send(res,200,{saved:true,stage:snapshot({...stage,number:nextNumber,active,reveal,projectedComment:comment,updated,timerDuration:currentClock.duration,timerRemaining:remaining,timerUntil:until})});return;
 }
 if(body.action==='feedback'){
  if(!await teacher(req)){send(res,401,{error:'Acesso reservado ao educador.'});return;}
  const row=(await getRows()).find(r=>r.id===body.rowId&&r.properties?.atividade===ACTIVITY);
  if(!row){send(res,404,{error:'Participante não encontrado.'});return;}
  const id=str(body.questionId,100),comment=str(body.comment,1200);
  if(!IDS.includes(id)){send(res,422,{error:'Questão inválida.'});return;}
  const feedback=safeParse(row.properties?.devolutivas,{});
  feedback[id]=comment;
  await request('/collections/'+RESPONSES+'/items','PUT',{itemsToUpdate:[{id:row.id,properties:{devolutivas:JSON.stringify(feedback),atualizacao:new Date().toISOString()}}]});
  send(res,200,{saved:true});return;
 }
 if(!await classAccess(str(body.code,80))){send(res,403,{error:'Código da turma incorreto.'});return;}
 const studentId=str(body.studentId,90),name=str(body.name,120).replace(/\s+/g,' '),group=str(body.group,80);
 if(!/^[a-z0-9-]{12,90}$/i.test(studentId)||name.length<4||group!=='CPOP - Campo Mourão'){send(res,422,{error:'Identificação inválida.'});return;}
 if(body.version!==version){send(res,409,{error:'O professor atualizou o banco de questões. Recarregue para sincronizar antes de enviar.'});return;}
 const answers=normalizeAnswers(body.answers,questions);
 if(!answers||answers.some(x=>!x)){send(res,422,{error:'Respostas fora do formato esperado.'});return;}
 const scored=scoreOf(answers,questions);
 const final=body.final===true;
 if(final&&scored.missing){send(res,422,{error:'Responda a todas as questões com uma alternativa ou um comentário de pelo menos 8 caracteres.',missing:scored.missing});return;}
 const existing=(await getRows()).find(r=>r.properties?.atividade===ACTIVITY&&r.properties?.alunoid===studentId);
 if(existing?.properties?.finalizado===true){send(res,409,{error:'Esta tentativa já foi finalizada. Solicite ao professor uma nova oportunidade.'});return;}
 const now=new Date().toISOString(),props={alunoid:studentId,nome:name,turma:group,atividade:ACTIVITY,respostas:JSON.stringify(answers),finalizado:final,pontos:scored.correct,atualizacao:now,identificador:studentId,versao:version};
 let result;
 if(existing){result=await request('/collections/'+RESPONSES+'/items','PUT',{itemsToUpdate:[{id:existing.id,properties:props}]});}
 else{result=await request('/collections/'+RESPONSES+'/items','POST',{items:[{participante:name,properties:{...props,devolutivas:'{}'}}]});}
 if(!result){throw Error('A integração não confirmou a gravação.');}
 send(res,200,{saved:true,final,updated:now,correct:final?scored.correct:null,answered:scored.answered,commentsOnly:scored.commentsOnly,missing:scored.missing,total:questions.length});return;
 }catch(e){console.error('Mini simulado',e.code||e.message,e.status||'');send(res,503,{saved:false,error:'Não foi possível sincronizar com o Craft. Os dados locais devem ser preservados até uma nova tentativa.'});}
};
