'use strict';
const crypto=require('node:crypto');
const {send,method,teacher,classAccess,parseBody,str}=require('./_http');
const {request,itemsOf}=require('./_craft');
const CONTENT=process.env.CRAFT_CONTENT_COLLECTION_ID;
const RESPONSES='675a73a0-b3c2-6a26-4613-0cc6dac7a844';
const TYPES=new Set(['text','textarea','radio','select','rating','checkbox']);
const stamp=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0,16);
const safe=x=>typeof x==='string'?x.trim():'';
const validId=x=>/^[a-z0-9_-]{4,90}$/i.test(x);
const json=(x,f)=>{try{const v=JSON.parse(x||'');return v??f}catch{return f}};
function fieldsOf(raw){
 const a=Array.isArray(raw)?raw:json(raw,[]);
 if(!Array.isArray(a)||a.length<1||a.length>15)return null;
 const seen=new Set(),out=[];
 for(const x of a){
  if(!x||typeof x!=='object')return null;
  const id=safe(x.id),kind=safe(x.kind),label=safe(x.label).slice(0,240),hint=safe(x.hint).slice(0,400);
  if(!validId(id)||seen.has(id)||!TYPES.has(kind)||label.length<4)return null;
  seen.add(id);
  const options=Array.isArray(x.options)?x.options.map(v=>safe(v)).filter(Boolean):[];
  if(['radio','select'].includes(kind)&&(options.length<2||options.length>6||options.some(v=>v.length>240)||new Set(options).size!==options.length))return null;
  const correct=kind==='radio'?Number(x.correct)||0:0;
  if(!Number.isInteger(correct)||correct<0||correct>options.length)return null;
  out.push({id,kind,label,hint,required:x.required!==false,options:['radio','select'].includes(kind)?options:[],correct,explanation:safe(x.explanation).slice(0,900)});
 }
 return out;
}
function normalize(row){
 const p=row.properties||{};
 if(p.tipo!=='formulario')return null;
 const fields=fieldsOf(p.opcoes);
 if(!fields)return null;
 return {id:row.id,uid:String(p.uid||''),week:Number(p.semana),order:Number(p.ordem)||0,title:String(p.titulo||''),description:String(p.corpo||''),active:p.ativo===true,fields,updated:String(p.atualizado||''),revision:stamp([p.uid,p.semana,p.ordem,p.titulo,p.corpo,p.opcoes,p.ativo])};
}
function publicForm(f){return {id:f.uid,uid:f.uid,week:f.week,title:f.title,description:f.description,version:f.revision,fields:f.fields.map(({id,kind,label,hint,required,options})=>({id,kind,label,hint,required,options}))};}
async function allForms(){
 if(!CONTENT||!/^[0-9a-f-]{36}$/i.test(CONTENT))throw Error('Coleção de conteúdo não configurada.');
 const rows=itemsOf(await request('/collections/'+CONTENT+'/items?maxDepth=0'));
 return rows.map(normalize).filter(Boolean).sort((a,b)=>a.week-b.week||a.order-b.order);
}
async function answerRows(){return itemsOf(await request('/collections/'+RESPONSES+'/items?maxDepth=0'));}
function answersFor(row){
 const p=row.properties||{},a=json(p.respostas,{});
 return {id:row.id,formId:String(p.atividade||'').slice(5),studentId:String(p.alunoid||''),name:String(p.nome||''),group:String(p.turma||''),answers:a&&typeof a==='object'&&!Array.isArray(a)?a:{},updated:String(p.atualizacao||''),final:p.finalizado===true};
}
function validateForm(raw,current){
 const uid=safe(raw?.uid),week=Number(raw?.week),order=Number(raw?.order),title=safe(raw?.title),description=safe(raw?.description),fields=fieldsOf(raw?.fields);
 if(!validId(uid)||![24,25,26].includes(week)||!Number.isInteger(order)||order<0||order>9999||title.length<4||title.length>220||description.length<5||description.length>12000||!fields)return null;
 return {uid,semana:week,ordem:order,tipo:'formulario',titulo:title,corpo:description,opcoes:JSON.stringify(fields),ativo:raw.active===true,fonte:'CPOP · Formulário interativo docente',pontos:0};
}
function validateAnswers(form,raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 if(Object.keys(raw).some(id=>!form.fields.some(f=>f.id===id)))return null;
 const answers={};
 for(const f of form.fields){
  const value=raw[f.id];
  if(f.kind==='checkbox'){
   if(value!==true&&value!==false&&value!==undefined)return null;
   if(f.required&&value!==true)return null;
   answers[f.id]=value===true;continue;
  }
  if(value===undefined||value===null||value===''){
   if(f.required)return null;answers[f.id]='';continue;
  }
  if(f.kind==='rating'){
   if(!Number.isInteger(value)||value<1||value>5)return null;
   answers[f.id]=value;continue;
  }
  if(typeof value!=='string')return null;
  const s=value.trim();
  if(['radio','select'].includes(f.kind)){
   if(!f.options.includes(s))return null;
  }else if(s.length>(f.kind==='textarea'?2500:300))return null;
  if(f.required&&!s)return null;
  answers[f.id]=s;
 }
 return answers;
}
function feedback(form,answers){
 const keyed=form.fields.filter(f=>f.kind==='radio'&&f.correct>0);
 const correct=keyed.filter(f=>answers[f.id]===f.options[f.correct-1]).length;
 return {score:correct,possible:keyed.length,items:keyed.map(f=>({id:f.id,correct:answers[f.id]===f.options[f.correct-1],answer:f.options[f.correct-1],explanation:f.explanation}))};
}
module.exports=async(req,res)=>{
 if(!method(req,res,['GET','POST']))return;
 try{
  const forms=await allForms(),body=req.method==='POST'?parseBody(req)||{}:{};
  const mode=req.query?.mode||new URL(req.url||'/', 'https://cpop.local').searchParams.get('mode');
  if(req.method==='GET'&&mode==='teacher'){
   if(!await teacher(req)){send(res,401,{error:'Acesso docente necessário.'});return;}
   const rows=(await answerRows()).filter(r=>String(r.properties?.atividade||'').startsWith('form:')).map(answersFor);
   send(res,200,{forms,records:rows});return;
  }
  if(req.method==='GET'){
   const listed=forms.filter(f=>f.active).map(publicForm),out={forms:listed};
   const studentId=str(req.query?.studentId||new URL(req.url||'/', 'https://cpop.local').searchParams.get('studentId'),90),code=str(req.headers['x-class-code'],80);
   if(studentId&&code&&await classAccess(code)){
    const rows=(await answerRows()).filter(r=>r.properties?.alunoid===studentId&&String(r.properties?.atividade||'').startsWith('form:')).map(answersFor);
    out.progress=rows.map(r=>{const form=forms.find(f=>f.uid===r.formId);return {...r,review:form?feedback(form,r.answers):null};});
   }
   send(res,200,out);return;
  }
  if(body.action==='save'){
   if(!await teacher(req)){send(res,401,{error:'Acesso docente necessário.'});return;}
   const p=validateForm(body.form);
   if(!p){send(res,422,{error:'Confira os campos, o enunciado e as alternativas antes de salvar.'});return;}
   const current=forms.find(f=>f.uid===p.uid);
   if(body.id){
    const old=forms.find(f=>f.id===body.id);
    if(!old){send(res,404,{error:'Formulário não encontrado.'});return;}
    if(old.revision!==body.revision){send(res,409,{error:'O conteúdo foi modificado no Craft. Recarregue antes de salvar.'});return;}
    if(current&&current.id!==old.id){send(res,409,{error:'Este identificador já está em uso.'});return;}
    await request('/collections/'+CONTENT+'/items','PUT',{itemsToUpdate:[{id:old.id,properties:p}]});
   }else{
    if(current){send(res,409,{error:'Este identificador já está em uso.'});return;}
    await request('/collections/'+CONTENT+'/items','POST',{items:[{bloco:'S'+p.semana+' · '+p.titulo,properties:p}]});
   }
   send(res,200,{saved:true,source:'Craft'});return;
  }
  if(body.action!=='submit'){send(res,422,{error:'Ação inválida.'});return;}
  if(!await classAccess(str(body.code,80))){send(res,403,{error:'Código da turma incorreto.'});return;}
  const form=forms.find(f=>f.uid===body.formId&&f.active),studentId=str(body.studentId,90),name=str(body.name,120).replace(/\s+/g,' '),group=str(body.group,80);
  if(!form){send(res,404,{error:'Atividade não disponível.'});return;}
  if(!/^[a-z0-9-]{12,90}$/i.test(studentId)||name.length<4||group!=='CPOP - Campo Mourão'){send(res,422,{error:'Identificação inválida.'});return;}
  if(form.revision!==body.version){send(res,409,{error:'Esta atividade mudou no Craft. Atualize antes de enviar.'});return;}
  const answers=validateAnswers(form,body.answers);
  if(!answers){send(res,422,{error:'Preencha os campos obrigatórios e revise as respostas.'});return;}
  const rows=await answerRows(),activity='form:'+form.uid;
  const existing=rows.find(r=>r.properties?.atividade===activity&&r.properties?.alunoid===studentId);
  if(existing?.properties?.finalizado===true){send(res,409,{error:'Sua resposta já foi entregue. Converse com o professor se precisar reenviar.'});return;}
  const now=new Date().toISOString(),review=feedback(form,answers);
  const props={alunoid:studentId,nome:name,turma:group,atividade:activity,respostas:JSON.stringify(answers),finalizado:true,pontos:review.score,atualizacao:now,identificador:studentId,versao:form.revision};
  if(existing)await request('/collections/'+RESPONSES+'/items','PUT',{itemsToUpdate:[{id:existing.id,properties:props}]});
  else await request('/collections/'+RESPONSES+'/items','POST',{items:[{participante:name,properties:{...props,devolutivas:'{}'}}]});
  send(res,200,{saved:true,updated:now,review});return;
 }catch(e){console.error('Formulários CPOP',e.code||e.message,e.status||'');send(res,503,{saved:false,error:'Craft indisponível no momento. A resposta permanece neste dispositivo para novo envio.'});}
};