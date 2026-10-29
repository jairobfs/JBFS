'use strict';
const crypto=require('node:crypto');
const {loadContent,buildActivities,fingerprint}=require('./_lesson');const {send,method,str,eq,parseBody}=require('./_http');
const {listAttempts,saveAttempt}=require('./_craft');
module.exports=async(req,res)=>{
 if(!method(req,res,['POST']))return;
 const data=parseBody(req);if(!data||typeof data!=='object'||data.website){send(res,422,{error:'Envio inválido.'});return;}
 let activities,version;try{const rows=await loadContent();activities=buildActivities(rows);version='craft-'+fingerprint(rows.filter(r=>r.type==='questao'&&r.active))}catch(e){console.error('Submission content',e.code||e.message);send(res,503,{error:'A avaliação está temporariamente indisponível no Craft.'});return;}
 if(data.catalogVersion&&data.catalogVersion!==version){send(res,409,{error:'O educador atualizou as questões. Recarregue a aula para responder à versão atual.'});return;}
 const activity=activities.find(a=>a.id===data.activityId);const alias=str(data.alias,40),group=str(data.group,40),studentId=str(data.studentId,90),submissionId=str(data.submissionId,90),joinCode=str(data.joinCode,80);
 if(!activity||alias.length<2||studentId.length<12||submissionId.length<12||group.length<1||!Array.isArray(data.answers)){send(res,422,{error:'Identificação ou atividade inválida.'});return;}
 const configuredCode=process.env.CPOP_CLASS_CODE;if(!configuredCode||configuredCode.length<6){send(res,503,{error:'Código da turma ainda não configurado.'});return;}
 if(!eq(configuredCode,joinCode)){send(res,403,{error:'Código de acesso da turma incorreto.'});return;}
 if(data.answers.length!==activity.questions.length||data.answers.some(a=>typeof a?.id!=='string'||!Number.isInteger(a?.value)||a.value<1||a.value>6||typeof a.evidence!=='string'||a.evidence.length>900)){send(res,422,{error:'Respostas incompletas ou inválidas.'});return;}
 const byId=new Map(data.answers.map(a=>[a.id,a]));if(byId.size!==activity.questions.length||activity.questions.some(q=>!byId.has(q.id))){send(res,422,{error:'Há questões ausentes ou repetidas.'});return;}
 if(activity.questions.some(q=>{const a=byId.get(q.id);return a.value>q.options.length||(q.evidence&&str(a.evidence,900).length<8)})){send(res,422,{error:'Responda a todas as questões e justifique as inferências.'});return;}
 const feedback=activity.questions.map(q=>({id:q.id,selected:byId.get(q.id).value,correct:q.answer,isCorrect:byId.get(q.id).value===q.answer,why:q.why}));
 const correct=feedback.filter(f=>f.isCorrect).length,maximum=activity.questions.length*100+100,points=correct*100+(correct===feedback.length?100:0);
 const idempotency=crypto.createHash('sha256').update(`${studentId}:${activity.id}:${submissionId}`).digest('hex');const elapsed=Math.round(Math.max(0,Math.min(7200,Number(data.elapsedSeconds)||0)));
 const cleanAnswers=activity.questions.map(q=>({id:q.id,value:byId.get(q.id).value,evidence:str(byId.get(q.id).evidence,900),correct:q.answer}));
 try{
  const existing=await listAttempts();const found=existing.find(x=>x?.properties?.idempotencia===idempotency);
  if(found){send(res,200,{saved:true,duplicate:true,activityId:activity.id,points,maximum,correct,total:feedback.length,feedback,unlock:activity.type==='escape'&&correct===feedback.length?'2413':null});return;}
  const attemptNum=existing.filter(x=>x?.properties?.alunoid===studentId&&x?.properties?.jogo===activity.id).length+1;
  const item={tentativa:`${activity.week} · ${alias} · ${submissionId.slice(0,8)}`,properties:{alunoid:studentId,apelido:alias,turma:group,semana:activity.week,jogo:activity.id,pontos:points,maximo:maximum,duracaoseg:elapsed,numerotentativa:attemptNum,respostasjson:JSON.stringify(cleanAnswers),quandoiso:new Date().toISOString(),idempotencia:idempotency,versao:version}};
  const saved=await saveAttempt(item);if(!saved||(!Array.isArray(saved.items)&&!Array.isArray(saved.data?.items))){throw new Error('O Craft não confirmou os itens adicionados.')}
  send(res,200,{saved:true,duplicate:false,activityId:activity.id,points,maximum,correct,total:feedback.length,feedback,unlock:activity.type==='escape'&&correct===feedback.length?'2413':null});
 }catch(e){send(res,503,{saved:false,error:'Não foi possível confirmar a gravação no Craft. Suas respostas permanecem neste dispositivo para nova tentativa.',reason:e.code||'craft-unavailable'});}
};
