'use strict';
const {request}=require('./_craft');
const {send,method,parseBody,str,eq}=require('./_http');
const ROSTER_BLOCK='69c15007-6896-a200-febd-c78bf1215631';
function normalize(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');}
module.exports=async(req,res)=>{
 if(!method(req,res,['POST']))return;
 const body=parseBody(req);
 const query=str(body?.query,90),joinCode=str(body?.joinCode,80);
 const configured=process.env.CPOP_CLASS_CODE;
 if(!configured||!eq(joinCode,configured)){send(res,403,{error:'Código da turma incorreto.'});return;}
 if(query.length<2){send(res,200,{names:[]});return;}
 try{
  const result=await request('/blocks?id='+ROSTER_BLOCK+'&maxDepth=0');
  const rows=Array.isArray(result.data)?result.data:Array.isArray(result.blocks)?result.blocks:Array.isArray(result.items)?result.items:[];
  const row=rows[0]||((result.data&&!Array.isArray(result.data))?result.data:{});
  const markdown=String(row.markdown||row.text?.value||'');
  const names=markdown.split(/\r?\n|\\n/).map(s=>s.trim()).filter(s=>s.startsWith('- ')).map(s=>s.slice(2).trim()).filter(Boolean);
  send(res,200,{names:names.filter(name=>normalize(name).includes(normalize(query))).slice(0,8)});
 }catch(e){console.error('Roster lookup',e.code||e.message);send(res,503,{error:'Lista de presença temporariamente indisponível.'});}
};