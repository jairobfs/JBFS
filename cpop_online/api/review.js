const {classAccess}=require('./_http');
'use strict';
const crypto=require('node:crypto');
const {send,method,str,eq,parseBody}=require('./_http');
const {request,itemsOf}=require('./_craft');
const {loadContent}=require('./_lesson');
function reviewCollection(){const id=process.env.CRAFT_REVIEW_COLLECTION_ID;if(!/^[a-f0-9-]{36}$/i.test(id||''))throw new Error('REVIEWS_NOT_CONFIGURED');return id}
async function allReviews(){return itemsOf(await request('/collections/'+reviewCollection()+'/items?maxDepth=0'))}
function clean(row){const p=row.properties||{};return {id:String(row.id||''),cardId:String(p.cartaoid||''),week:Number(p.semana)||0,rating:String(p.avaliacao||''),repetition:Number(p.repeticao)||0,intervalDays:Number(p.intervalodias)||0,nextAt:String(p.proximaiso||''),at:String(p.quandoiso||'')}}
module.exports=async(req,res)=>{
 if(!method(req,res,['POST']))return;
 const body=parseBody(req),studentId=str(body?.studentId,90),joinCode=str(body?.joinCode,80),action=str(body?.action,20);
 if(!await classAccess(joinCode)||studentId.length<12){send(res,403,{error:'Identificação da turma inválida.'});return;}
 if(!['list','rate'].includes(action)){send(res,422,{error:'Ação de revisão inválida.'});return;}
 try{
  const rows=await allReviews(),personal=rows.filter(r=>r.properties?.alunoid===studentId).map(clean).sort((a,b)=>b.at.localeCompare(a.at));
  if(action==='list'){
   const latest=Object.values(personal.reduce((acc,r)=>{if(r.cardId&&!acc[r.cardId])acc[r.cardId]=r;return acc},{}));
   send(res,200,{source:'Craft',reviews:latest,events:personal.length});return;
  }
  const cardId=str(body.cardId,100),rating=str(body.rating,20),requestId=str(body.requestId,100),week=Number(body.week);
  if(!['lembrei','rever'].includes(rating)||!Number.isInteger(week)||![24,25,26].includes(week)||!/^[A-Za-z0-9_-]{4,100}$/.test(cardId)||requestId.length<12){send(res,422,{error:'Cartão ou avaliação inválidos.'});return;}
  const cards=(await loadContent()).filter(x=>x.type==='cartao'&&x.active);
  if(!cards.some(c=>c.uid===cardId&&c.week===week)){send(res,404,{error:'Este cartão não existe mais na aula.'});return;}
  const idem=crypto.createHash('sha256').update(studentId+':'+cardId+':'+requestId).digest('hex');
  const duplicate=rows.find(r=>r.properties?.idempotencia===idem);
  if(duplicate){send(res,200,{saved:true,duplicate:true,review:clean(duplicate)});return;}
  const prior=personal.find(r=>r.cardId===cardId);
  const repetition=rating==='lembrei'?(prior?.repetition||0)+1:0;
  const intervals=[1,3,7,14,30,60];
  const intervalDays=rating==='rever'?0:intervals[Math.min(intervals.length-1,repetition-1)];
  const now=new Date(),next=new Date(now.getTime()+intervalDays*86400000);
  const item={reviso:week+' · '+cardId+' · '+now.toISOString().slice(0,16),properties:{alunoid:studentId,semana:week,cartaoid:cardId,avaliacao:rating,repeticao:repetition,intervalodias:intervalDays,proximaiso:next.toISOString(),quandoiso:now.toISOString(),idempotencia:idem}};
  const saved=await request('/collections/'+reviewCollection()+'/items','POST',{items:[item]});
  const added=itemsOf(saved);if(!added.length)throw new Error('CRAFT_DID_NOT_CONFIRM');
  send(res,200,{saved:true,duplicate:false,review:{id:String(added[0]?.id||''),cardId,week,rating,repetition,intervalDays,nextAt:next.toISOString(),at:now.toISOString()}});
 }catch(e){console.error('Craft card review',e.code||e.message);send(res,503,{error:'A revisão não pôde ser confirmada no Craft. Tente novamente.'});}
};
