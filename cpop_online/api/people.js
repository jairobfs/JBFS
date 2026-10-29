const {classAccess}=require('./_http');
'use strict';
const {request,itemsOf}=require('./_craft');
const {send,method,teacher,parseBody,eq}=require('./_http');
const COLLECTION='c7cf9221-23c4-deae-0324-43ebee1bb7d4';
const revision=rows=>require('node:crypto').createHash('sha256').update(JSON.stringify(rows)).digest('hex').slice(0,16);
module.exports=async(req,res)=>{
 if(!method(req,res,['GET','POST','PUT']))return;
 const admin=await teacher(req),data=parseBody(req);
 if(!admin&&(req.method!=='POST'||!await classAccess(data?.joinCode||''))){send(res,403,{error:'Informe o código da turma para consultar os nomes.'});return;}
 try{
 const rows=itemsOf(await request('/collections/'+COLLECTION+'/items?maxDepth=0')).map(x=>({id:x.id,name:String(x.nome||x.title||''),active:x.properties?.ativo!==false}));
 if(req.method==='PUT'){
   if(!admin){send(res,401,{error:'Acesso reservado ao educador.'});return;}
   if(data?.revision!==revision(rows)){send(res,409,{error:'A lista mudou no Craft. Recarregue antes de salvar.'});return;}
   const name=String(data?.name||'').trim().replace(/\s+/g,' ');
   if(name.length<4||name.length>120){send(res,422,{error:'Informe um nome entre 4 e 120 caracteres.'});return;}
   if(rows.some(x=>x.id!==data.id&&x.name.toLocaleLowerCase('pt-BR')===name.toLocaleLowerCase('pt-BR'))){send(res,409,{error:'Este nome já está cadastrado.'});return;}
   if(data.id){if(!rows.some(x=>x.id===data.id)){send(res,404,{error:'Participante não encontrado.'});return;}await request('/collections/'+COLLECTION+'/items','PUT',{itemsToUpdate:[{id:data.id,nome:name,properties:{ativo:data.active!==false}}]});}
   else await request('/collections/'+COLLECTION+'/items','POST',{items:[{nome:name,properties:{ativo:true}}]});
   send(res,200,{saved:true});return;
 }
 send(res,200,{revision:revision(rows),items:admin?rows:rows.filter(x=>x.active).map(({name})=>({name}))});
 }catch(e){send(res,503,{error:'Não foi possível sincronizar a lista com o Craft.'});}
};
