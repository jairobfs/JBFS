'use strict';
const {send,method,teacher,parseBody}=require('./_http'),{hash,verify,config,COLLECTION}=require('./_access'),{request}=require('./_craft');
module.exports=async(req,res)=>{if(!method(req,res,['GET','PUT']))return;if(!await teacher(req)){send(res,401,{error:'PIN do professor inválido.'});return;}try{
const current=await config();if(req.method==='GET'){send(res,200,{group:'CPOP - Campo Mourão',configured:true});return;}
const d=parseBody(req),pin=String(d?.pin||''),code=String(d?.code||'').trim();if(!pin&&!code){send(res,422,{error:'Preencha o novo PIN ou o novo código.'});return;}if(pin&&!/^\d{4,12}$/.test(pin)||code&&(code.length<4||code.length>80)){send(res,422,{error:'Use PIN de 4 a 12 dígitos e código com 4 a 80 caracteres.'});return;}
const properties={...(pin?{pinhash:hash(pin)}:{}),...(code?{codehash:hash(code)}:{})};await request('/collections/'+COLLECTION+'/items','PUT',{itemsToUpdate:[{id:current.id,properties}]});const check=await config();if(Object.entries(properties).some(([k,v])=>check.properties?.[k]!==v))throw Error('Não confirmado');send(res,200,{saved:true,pinChanged:!!pin,codeChanged:!!code});
}catch{send(res,503,{error:'Não foi possível confirmar a alteração. Confira o acesso antes de tentar novamente.'});}};
