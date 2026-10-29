'use strict';
const {send,method,teacher,parseBody}=require('./_http');
const {request,itemsOf}=require('./_craft');
const {loadContent}=require('./_lesson');
const id=process.env.CRAFT_LIVE_COLLECTION_ID;
async function get(){if(!id||!(/^[0-9a-f-]{36}$/i.test(id)))throw Error('Sessão não configurada');const arr=itemsOf(await request('/collections/'+id+'/items?maxDepth=0'));const item=arr[0];if(!item)throw Error('Sessão não encontrada');const p=item.properties||{};return {row:item.id,week:Number(p.semana)||24,uid:String(p.uid||''),active:p.ativo===true,updatedAt:String(p.atualizado||'')}}
module.exports=async(req,res)=>{if(!method(req,res,['GET','PUT']))return;
 if(req.method==='PUT'&&!await teacher(req)){send(res,401,{error:'Apenas o educador controla a apresentação.'});return;}
 try{const cur=await get();if(req.method==='GET'){send(res,200,{week:cur.week,uid:cur.uid,active:cur.active,updatedAt:cur.updatedAt,source:'Craft'});return;}
 const b=parseBody(req)||{};const week=Number(b.week),uid=String(b.uid||''),active=b.active===true;if(![24,25,26].includes(week)||!/^[A-Za-z0-9_-]{4,90}$/.test(uid)){send(res,422,{error:'Etapa inválida.'});return}
 const all=await loadContent();if(!all.some(x=>x.active&&x.week===week&&x.uid===uid)){send(res,422,{error:'Escolha um slide ou desafio publicado no Craft.'});return}
 const changes={};if(cur.week!==week)changes.semana=week;if(cur.uid!==uid)changes.uid=uid;if(cur.active!==active)changes.ativo=active;if(Object.keys(changes).length){changes.atualizado=new Date().toISOString();await request('/collections/'+id+'/items','PUT',{itemsToUpdate:[{id:cur.row,properties:changes}]});}
 send(res,200,{saved:true,week,uid,active,updatedAt:changes.atualizado||cur.updatedAt,source:'Craft'});
 }catch(e){console.error('Live state',e.code||e.message,e.status||'');send(res,503,{error:'Não foi possível sincronizar a apresentação com o Craft.'})}
};
