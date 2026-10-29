'use strict';
const {send,method,teacher}=require('./_http');
const {request,itemsOf}=require('./_craft');
module.exports=async(req,res)=>{
 if(!method(req,res,['GET']))return;
 if(!await teacher(req)){send(res,401,{error:'Acesso reservado ao educador.'});return;}
 const collection=process.env.CRAFT_REVIEW_COLLECTION_ID;
 if(!/^[a-f0-9-]{36}$/i.test(collection||'')){send(res,503,{error:'Coleção de revisões não configurada.'});return;}
 try{
  const raw=itemsOf(await request('/collections/'+collection+'/items?maxDepth=0'));
  const reviews=raw.map(x=>{const p=x.properties||{};return {id:String(x.id||''),studentId:String(p.alunoid||''),week:Number(p.semana)||0,cardId:String(p.cartaoid||''),rating:String(p.avaliacao||''),repetition:Number(p.repeticao)||0,intervalDays:Number(p.intervalodias)||0,nextAt:String(p.proximaiso||''),at:String(p.quandoiso||'')}}).sort((a,b)=>b.at.localeCompare(a.at));
  send(res,200,{source:'Craft',reviews});
 }catch(e){console.error('Teacher review analytics',e.code||e.message);send(res,503,{error:'Não foi possível consultar as revisões do Craft.'});}
};
