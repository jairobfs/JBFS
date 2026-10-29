'use strict';
const {send,method,teacher,parseBody}=require('./_http');
const {FIELDS,loadContent,revision,updateItem,createItem,media}=require('./_lesson');
function validRecord(raw,editing=false){if(!raw||typeof raw!=='object')return null;const uid=String(raw.uid||'').trim().slice(0,90),week=Number(raw.week),order=Number(raw.order),type=String(raw.type||''),title=String(raw.title||'').trim().slice(0,220),body=String(raw.body||'').slice(0,16000),image=String(raw.image||'').trim(),alt=String(raw.alt||'').slice(0,500),source=String(raw.source||'').slice(0,500),options=raw.options;
 if(!/^[A-Za-z0-9_-]{4,90}$/.test(uid)||![24,25,26].includes(week)||!Number.isFinite(order)||order<0||order>9999||!['slide','questao'].includes(type)||!title||!body||image&&!media(image)||!Array.isArray(options)||options.length>6||options.some(s=>typeof s!=='string'||!s.trim()||s.length>600))return null;
 const answer=Number(raw.answer)||0,why=String(raw.why||'').slice(0,1800);
 if(type==='questao'&&(options.length<2||answer<1||answer>options.length||!why))return null;
 return {uid,semana:week,ordem:Math.round(order),tipo:type,titulo:title,corpo:body,imagem:image,alt,fonte:source,opcoes:type==='questao'?JSON.stringify(options):'',gabarito:type==='questao'?answer:0,justificativa:type==='questao'?why:'',ativo:raw.active!==false,pontos:type==='questao'?100:0};
}
module.exports=async(req,res)=>{if(!method(req,res,['GET','PUT','POST']))return;if(!teacher(req)){send(res,401,{error:'Acesso reservado ao educador.'});return;}
 try{const rows=await loadContent();if(req.method==='GET'){send(res,200,{source:'Craft',items:rows});return;}
  const data=parseBody(req);const p=validRecord(data?.item);if(!p){send(res,422,{error:'Campos inválidos. Revise título, texto, alternativas e gabarito.'});return;}
  if(req.method==='PUT'){const id=String(data?.id||'');const current=rows.find(r=>r.id===id);if(!current){send(res,404,{error:'Bloco inexistente no Craft.'});return}
   if(current.revision!==data.revision){send(res,409,{error:'Este bloco foi alterado em outro lugar. Recarregue antes de salvar.',current});return}
   if(p.uid!==current.uid&&rows.some(r=>r.uid===p.uid)){send(res,409,{error:'Identificador já usado em outro bloco.'});return}
   const prev={uid:current.uid,semana:current.week,ordem:current.order,tipo:current.type,titulo:current.title,corpo:current.body,imagem:current.image,alt:current.alt,fonte:current.source,opcoes:current.type==='questao'?JSON.stringify(current.options):'',gabarito:current.answer,justificativa:current.why,ativo:current.active,pontos:current.points};
   const changes=Object.fromEntries(Object.entries(p).filter(([k,v])=>v!==prev[k]));
   if(Object.keys(changes).length)await updateItem(id,changes);
   send(res,200,{saved:true,changed:Object.keys(changes),source:'Craft'});return;
  }
  if(rows.some(r=>r.uid===p.uid)){send(res,409,{error:'Já existe um bloco com este identificador.'});return}
  await createItem({bloco:'S'+p.semana+' · '+p.titulo,properties:p});send(res,201,{saved:true,created:true,source:'Craft'});
 }catch(e){console.error('Lesson edit',e.code||e.message,e.status||'');send(res,503,{error:'Não foi possível sincronizar esta edição com o Craft.'})}};
