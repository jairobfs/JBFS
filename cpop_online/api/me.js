'use strict';
const {send,method,parseBody,str,eq}=require('./_http');
const {listAttempts}=require('./_craft');
module.exports=async(req,res)=>{if(!method(req,res,['POST']))return;
 const b=parseBody(req);const studentId=str(b?.studentId,90),joinCode=str(b?.joinCode,80);
 if(!process.env.CPOP_CLASS_CODE||!eq(joinCode,process.env.CPOP_CLASS_CODE)||studentId.length<12){send(res,403,{error:'Identificação da turma inválida.'});return}
 try{const all=await listAttempts();const attempts=all.filter(i=>i.properties?.alunoid===studentId).map(i=>{const p=i.properties||{};let answers=[];try{answers=JSON.parse(p.respostasjson||'[]');if(!Array.isArray(answers))answers=[]}catch{}return {id:i.id||'',week:Number(p.semana),activityId:String(p.jogo||''),points:Number(p.pontos)||0,maximum:Number(p.maximo)||0,elapsedSeconds:Number(p.duracaoseg)||0,attempt:Number(p.numerotentativa)||1,at:String(p.quandoiso||''),answers:answers.map(a=>({id:a.id,value:a.value,correct:a.correct,evidence:String(a.evidence||'').slice(0,900)}))}}).sort((a,b)=>b.at.localeCompare(a.at));
 const weeks=[24,25,26].map(week=>{const list=attempts.filter(a=>a.week===week),best=list.reduce((a,b)=>!a||b.points/b.maximum>a.points/a.maximum?b:a,null);return {week,attempts:list.length,bestPercent:best?Math.round(best.points/Math.max(1,best.maximum)*100):null,lastAt:list[0]?.at||null}});
 send(res,200,{studentId,attempts,weeks,source:'Craft'});
 }catch(e){console.error('Student progress',e.code||e.message);send(res,503,{error:'Não foi possível consultar o progresso no Craft.'})}
};