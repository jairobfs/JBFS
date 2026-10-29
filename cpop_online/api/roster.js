const {classAccess}=require('./_http');
'use strict';
const {request,itemsOf}=require('./_craft');
const {send,method,parseBody,str,eq}=require('./_http');
module.exports=async(req,res)=>{
 if(!method(req,res,['POST']))return;
 const body=parseBody(req),query=str(body?.query,90),code=process.env.CPOP_CLASS_CODE;
 if(!await classAccess(body?.joinCode||'')){send(res,403,{error:'Código da turma incorreto.'});return;}
 if(query.length<2){send(res,200,{names:[]});return;}
 const norm=x=>String(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
 try{const rows=itemsOf(await request('/collections/c7cf9221-23c4-deae-0324-43ebee1bb7d4/items?maxDepth=0'));send(res,200,{names:rows.filter(x=>x.properties?.ativo!==false).map(x=>String(x.nome||x.title||'')).filter(x=>norm(x).includes(norm(query))).slice(0,8)});}catch{send(res,503,{error:'Lista temporariamente indisponível.'});}
};
