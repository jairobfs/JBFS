'use strict';
const crypto=require('node:crypto');
const {send,method,parseBody,classAccess}=require('./_http');
const COOKIE='cpop_personal_craft';
const MAX_NOTE=2400;
const ID=/^[A-Za-z0-9_-]{4,100}$/;
const UUID=/^[a-f0-9-]{36}$/i;
function key(){if(!process.env.CRAFT_API_KEY)throw Error('Chave de proteção não configurada.');return crypto.createHash('sha256').update(process.env.CRAFT_API_KEY).digest();}
function seal(value){const iv=crypto.randomBytes(12),c=crypto.createCipheriv('aes-256-gcm',key(),iv);const payload=Buffer.concat([c.update(JSON.stringify(value)),c.final()]);return Buffer.concat([iv,c.getAuthTag(),payload]).toString('base64url');}
function unseal(req){try{const raw=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(!raw)return null;const b=Buffer.from(raw,'base64url');if(b.length<30)return null;const d=crypto.createDecipheriv('aes-256-gcm',key(),b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return JSON.parse(Buffer.concat([d.update(b.subarray(28)),d.final()]).toString());}catch{return null;}}
function cookie(res,value){res.setHeader('Set-Cookie',COOKIE+'='+(value?seal(value):'')+'; Path=/api/me; HttpOnly; Secure; SameSite=Lax; Max-Age='+(value?2592000:0));}
function clean(v,n=140){return String(v||'').replace(/[\r\n<>*]/g,' ').replace(/\s+/g,' ').trim().slice(0,n);}
function validBase(str){try{const u=new URL(str);return u.protocol==='https:'&&u.hostname==='connect.craft.do'&&!u.port&&!u.search&&!u.hash&&!u.username&&!u.password&&/^\/links?\/[^/]+\/api\/v1\/?$/.test(u.pathname)?u.href.replace(/\/$/,''):null;}catch{return null;}}
async function api(c,path,method='GET',body){const r=await fetch(c.base+path,{method,redirect:'error',headers:{'Content-Type':'application/json','Accept':'application/json',...(c.key?{Authorization:'Bearer '+c.key}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(14000),cache:'no-store'});if(!r.ok)throw Object.assign(Error('Craft HTTP '+r.status),{status:r.status});return r.json();}
function docs(obj){return Array.isArray(obj)?obj:(obj?.items||obj?.documents||obj?.data?.documents||obj?.data||[]);}
function docId(obj){return obj?.rootBlockId||obj?.id||obj?.documentId||'';}
function blocks(value){const all=[];const seen=new Set();function walk(v){if(!v||typeof v!=='object')return;if(Array.isArray(v)){v.forEach(walk);return;}if(v.id&&typeof v.markdown==='string'&&!seen.has(v.id)){all.push(v);seen.add(v.id);}for(const k of ['data','items','blocks','content'])if(v[k])walk(v[k]);}walk(value);return all;}
function prefix(name,week,title){return '**'+clean(name,120)+' · S'+week+' · '+clean(title,220)+'** — ';}
function linkOf(c){return c.link&&/^https:\/\/docs\.craft\.do\//.test(c.link)?c.link:null;}
function owner(c,d){return !!c&&c.studentId===String(d?.studentId||'');}
async function original(c){return blocks(await api(c,'/blocks?id='+encodeURIComponent(c.page)+'&maxDepth=1'));}
module.exports=async(req,res)=>{
 if(!method(req,res,['GET','POST','PUT','DELETE']))return;
 let c=unseal(req);
 if(req.method==='GET'){send(res,200,{connected:!!c,pageLink:c?linkOf(c):null,week:c?.week||null});return;}
 if(req.method==='DELETE'){cookie(res,null);send(res,200,{disconnected:true});return;}
 const d=parseBody(req)||{};
 if(!await classAccess(d.joinCode||'')){send(res,403,{error:'Código da turma incorreto.'});return;}
 try{
  if(req.method==='POST'&&['list','create','connect'].includes(d.action||'connect')){
   const base=validBase(d.base);
   if(!base){send(res,422,{error:'Abra a área Imagine no Craft e informe a URL da conexão API.'});return;}
   const connection={base,key:String(d.key||'').slice(0,400)};
   if(d.action==='list'){const raw=await api(connection,'/documents');const found=docs(raw);send(res,200,{documents:(Array.isArray(found)?found:[]).map(x=>({id:docId(x),title:clean(x.title||x.markdown||'Nota pessoal',220)})).filter(x=>UUID.test(x.id))});return;}
   const studentId=String(d.studentId||''),name=clean(d.name,120),week=Number(d.week);
   if(!ID.test(studentId)||name.length<4||![24,25,26].includes(week)){send(res,422,{error:'Identifique seu nome na turma e selecione a semana antes de conectar o Craft.'});return;}
   let page=d.page,link=null;
   if(d.action==='create'){
    const created=await api(connection,'/documents','POST',{documents:[{title:'Caderno de Linguagens · '+name}],destination:{destination:'unsorted'}});
    const first=docs(created)[0];page=docId(first);link=first?.clickableLink||null;
    if(!UUID.test(page))throw Error('Craft não retornou identificador da nota criada.');
    await api(connection,'/blocks','POST',{markdown:'## '+clean('CPOP - Campo Mourão · Meu percurso')+'\n\n<callout>**Meu percurso em Linguagens**\n\nEste caderno é pessoal. Acrescente explicações, dúvidas, exemplos e comentários diretamente no Craft ou pela aula interativa.</callout>\n\n## Anotações e descobertas\n\n<caption>Cada etapa da aula aparece abaixo, com suas observações para revisão.</caption>',position:{position:'end',pageId:page}});
   }else{
    if(!UUID.test(page)){send(res,422,{error:'Selecione uma nota existente para conectar.'});return;}
   }
   await api(connection,'/blocks?id='+encodeURIComponent(page)+'&maxDepth=0');
   try{const meta=await api(connection,'/connection'),space=meta?.space?.id||meta?.space?.spaceId;if(UUID.test(space))link='https://docs.craft.do/editor/d/'+space+'/'+page;}catch{}
   c={...connection,page,studentId,name,link};
   cookie(res,c);send(res,200,{connected:true,pageLink:linkOf(c),created:d.action==='create'});return;
  }
  if(!c){send(res,401,{error:'Conecte primeiro o caderno do seu Craft.'});return;}
  if(!owner(c,d)){send(res,403,{error:'Esta conexão pertence a outra identificação ou semana. Reconecte seu próprio caderno.'});return;}
  if(req.method==='POST'&&d.action==='pull'){
   const entries=Array.isArray(d.entries)?d.entries.slice(0,200):[];
   const current=await original(c);
   const notes=[];
   for(const e of entries){
    if(!ID.test(e.uid||''))continue;
    const p=prefix(c.name,Number(d.week),e.title);
    const found=current.find(b=>b.markdown.startsWith(p));
    if(found){const raw=found.markdown.slice(p.length);notes.push({uid:e.uid,text:raw.replace(/^Revisar\.\s*/,'').replace(/^Sem observações\.$/,'').slice(0,MAX_NOTE),pinned:/^Revisar\./.test(raw)});}
   }
   send(res,200,{connected:true,notes,pageLink:linkOf(c)});return;
  }
  if(req.method!=='PUT'){send(res,400,{error:'Ação de caderno não reconhecida.'});return;}
  if(!ID.test(d.uid||'')||String(d.text||'').length>MAX_NOTE||!d.title||![24,25,26].includes(Number(d.week))){send(res,422,{error:'Anotação inválida.'});return;}
  const p=prefix(c.name,Number(d.week),d.title),text=String(d.text||'').trim().replace(/\n+/g,' · ');
  const markdown=p+(d.pinned?'Revisar. ':'')+(text||'Sem observações.');
  const existing=(await original(c)).find(b=>b.markdown.startsWith(p));
  if(existing)await api(c,'/blocks','PUT',{blocks:[{id:existing.id,markdown}]});
  else await api(c,'/blocks','POST',{markdown,position:{position:'end',pageId:c.page}});
  const confirmed=(await original(c)).some(b=>b.markdown===markdown);
  if(!confirmed)throw Error('A gravação não foi confirmada.');
  send(res,200,{saved:true,pageLink:linkOf(c)});
 }catch(error){
  const message=error?.status===403?'A conexão Craft não tem permissão para escrever nessa nota. Confira o acesso concedido.':
   error?.status===429?'O Craft limitou os acessos por alguns segundos. Aguarde e tente novamente.':
   d.action==='create'?'O Craft não autorizou criar o caderno nesta conexão. Você pode selecionar uma nota existente ou ajustar as permissões.':
   'Não foi possível confirmar a gravação no Craft. Sua anotação permanece neste aparelho.';
  send(res,503,{error:message});
 }
};