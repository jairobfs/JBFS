(() => {
'use strict';
const APP=document.getElementById('app'), TOAST=document.getElementById('toast');
const MODE=new URLSearchParams(location.search).get('modo')||'aluno';
const ID='mini-linguagens-2026-11', API='/api/lesson?mini=1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatStem=s=>esc(String(s??'').replace(/\\n/g,'\n').replace(/\\\*/g,'*')).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
const stored=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k))??fallback}catch{return fallback}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const $=(s,base=document)=>base.querySelector(s);
const $$=(s,base=document)=>[...base.querySelectorAll(s)];
const safeNumber=x=>Number.isFinite(Number(x))?Number(x):0;
const richBody=x=>{const y=esc(String(x||'').replace(/\\([*_])/g,'$1'));return y.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*\n]+)\*/g,'<em>$1</em>').replace(/^&gt;\s?/gm,'');};
let bank=null,profile=null,answers=[],position=0,finalized=false,dirty=false,saveTimer=null,saveQueue=Promise.resolve(),statusText='',
    teacherToken=sessionStorage.getItem('cpop.teacher.token')||'',tData=null,tPosition=0,follow=stored('cpop.mini.follow',false),snapshot='';
const teacherView={mode:'all',query:''};
let clockBase=null;
const dark=stored('cpop.mini.dark',null);
document.documentElement.dataset.theme=dark===null?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):(dark?'dark':'light');
$('#toggleTheme').onclick=()=>{const yes=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=yes?'dark':'light';write('cpop.mini.dark',yes)};
$$('nav a').forEach(a=>{if(a.href.includes('modo='+MODE))a.classList.add('active')});
if(new URLSearchParams(location.search).get('embed')==='1'){$('.masthead')?.remove();$('footer')?.remove();}
function toast(msg){TOAST.textContent=msg;TOAST.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>TOAST.classList.remove('show'),4200)}
function wait(text='Consultando o Craft…'){APP.innerHTML='<section class="wait"><div class="spinner"></div><h1>Mini-simulado de Linguagens</h1><p>'+esc(text)+'</p></section>'}
function fail(e,again){APP.innerHTML='<section class="intro-form card"><div class="eyebrow">Sem confirmação de sincronização</div><h1>Não foi possível consultar o Craft.</h1><p>'+esc(e.message||e)+'</p><button class="primary" id="retry">Tentar novamente</button></section>';$('#retry').onclick=again}
async function fetchJSON(path,opts={}){
 const r=await fetch(path,{cache:'no-store',...opts});
 let j;try{j=await r.json()}catch{j={error:'Resposta de rede inválida.'}}
 if(!r.ok)throw Object.assign(new Error(j.error||'Falha de conexão com o Craft'),{status:r.status});
 return j;
}
function req(method,body,teacher=false){
 return fetchJSON(API,{method,headers:{'Content-Type':'application/json',...(teacher?{Authorization:'Bearer '+teacherToken}:{})},body:JSON.stringify(body)});
}
function renderQuestion(q,number,selected=0,showCorrect=false,correct=0){
 return '<div class="qid">QUESTÃO '+String(number).padStart(2,'0')+' · '+esc(q.title)+'</div><div class="stem">'+formatStem(q.body)+'</div>'+
  (q.image?'<figure><img src="'+esc(q.image)+'" loading="lazy" alt="'+esc(q.alt||q.title)+'"><figcaption>'+esc(q.source||'Acervo CPOP')+'</figcaption></figure>':'')+
  '<div class="choices">'+q.options.map((o,i)=>'<div class="choice '+(selected===i+1?'checked':'')+'" '+(showCorrect&&correct===i+1?'style="border-color:var(--green)"':'')+'><span class="letter">'+String.fromCharCode(65+i)+'</span><span>'+esc(o)+'</span></div>').join('')+'</div>'+
  '<p class="micro">Fonte: '+esc(q.source||'Banco canônico do CPOP')+'</p>';
}
function recoverQuestionImage(img){
 if(img.dataset.cpopMirror==='1')return false;
 let original;try{original=new URL(img.currentSrc||img.src,location.origin)}catch{return false;}
 const hosted=original.origin===location.origin||(/^cpop-linguagens(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(original.hostname));
 if(!hosted||!/^\/assets\/(?:canon\/)?[A-Za-z0-9._-]+\.(?:png|jpe?g|webp|svg)$/i.test(original.pathname))return false;
 img.dataset.cpopMirror='1';
 img.dataset.cpopPrimary=img.dataset.cpopPrimary||img.getAttribute('src')||original.pathname;
 img.src='https://raw.githubusercontent.com/jairobfs/JBFS/main/cpop_online'+original.pathname;
 return true;
}
document.addEventListener('error',event=>{
 const img=event.target;if(!(img instanceof HTMLImageElement)||!APP.contains(img))return;
 const figure=img.closest('figure');if(!figure)return;
 if(recoverQuestionImage(img))return;
 img.style.display='none';
 let notice=figure.querySelector('.mini-media-warning');
 if(!notice){
  notice=document.createElement('div');notice.className='mini-media-warning';notice.setAttribute('role','status');
  const label=document.createElement('span');label.textContent='A imagem desta questão não carregou. O enunciado e as alternativas permanecem disponíveis.';
  const retry=document.createElement('button');retry.type='button';retry.className='secondary';retry.textContent='Tentar imagem novamente';
  retry.addEventListener('click',()=>{notice.hidden=true;img.style.display='';img.dataset.cpopMirror='';const src=(img.dataset.cpopPrimary||img.getAttribute('src')).split('?')[0];img.src=src+'?retry='+Date.now();});
  notice.append(label,retry);figure.append(notice);
 }
 notice.hidden=false;
},true);
document.addEventListener('load',event=>{
 const img=event.target;if(!(img instanceof HTMLImageElement)||!APP.contains(img))return;
 img.style.display='';const warning=img.closest('figure')?.querySelector('.mini-media-warning');if(warning)warning.hidden=true;
},true);
function saveLocal(){if(!profile)return;write('cpop.mini.draft.'+profile.studentId,{answers,dirty:true,updated:Date.now()});}
function byId(id){let a=answers.find(x=>x.id===id);if(!a){a={id,choice:0,comment:''};answers.push(a);}return a;}
function completed(){return bank.questions.filter(q=>{let a=byId(q.id);return a.choice>0||a.comment.trim().length>=8}).length;}
function countStatus(){return bank.questions.map(q=>{const a=byId(q.id);return a.choice?'done':a.comment.trim().length>=8?'comment-only':''})}
function sharedProfile(){
 const p=stored('cpop.profile',null);
 return p&&String(p.name||'').trim().length>=4&&p.group==='CPOP - Campo Mourão'&&String(p.joinCode||'').trim()&&typeof p.studentId==='string'&&/^[a-z0-9-]{12,90}$/i.test(p.studentId)?p:null;
}
function profileForm(){
 const cached=sharedProfile()||stored('cpop.mini.profile',{})||{};
 APP.innerHTML='<section class="intro-form"><div class="eyebrow">CPOP · Campo Mourão</div><h1>Mini-simulado de Linguagens.</h1><p class="muted">Questões do acervo Craft, com alternativas e comentários. Responda pelo celular; cada envio confirmado fica disponível no painel do educador.</p><div class="card"><form id="join" class="stack"><label class="field">Nome completo<input name="name" list="rosterNames" value="'+esc(cached.name||'')+'" autocomplete="name" maxlength="120" required></label><div class="row"><button id="loadRoster" type="button">Buscar nome na lista de presença</button><span class="micro" id="rosterStatus"></span></div><datalist id="rosterNames"></datalist><label class="field">Turma<input value="CPOP - Campo Mourão" readonly></label><label class="field">Código de participação<input name="code" type="password" value="'+esc(cached.code||cached.joinCode||'')+'" required autocomplete="off"></label><button class="primary" type="submit">Entrar no mini-simulado</button><p class="micro">A senha do Craft não é solicitada. O código da turma apenas autoriza o envio; os comentários são visíveis ao educador.</p></form></div></section>';
 $('#loadRoster').onclick=async()=>{const code=$('#join').elements.code.value.trim();if(!code){toast('Informe primeiro o código da turma.');return;}$('#rosterStatus').textContent='Consultando Craft…';try{const j=await fetchJSON('/api/people',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({joinCode:code})});$('#rosterNames').innerHTML=(j.items||[]).map(x=>'<option value="'+esc(x.name)+'"></option>').join('');$('#rosterStatus').textContent=(j.items||[]).length+' nomes disponíveis';toast('Lista de presença recuperada do Craft.');}catch(e){$('#rosterStatus').textContent='Lista indisponível';toast(e.message)}};
 $('#join').onsubmit=async e=>{
  e.preventDefault();
  const form=e.target;
  const name=form.elements.name.value.trim().replace(/\s+/g,' '),code=form.elements.code.value.trim();
  if(name.length<4||!code){toast('Informe nome completo e código.');return}
  try{await fetchJSON('/api/people',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({joinCode:code})});}catch(e){toast(e.message||'Código inválido ou lista de presença indisponível.');return;}
  const samePerson=String(cached.name||'').trim().toLocaleLowerCase('pt-BR')===name.toLocaleLowerCase('pt-BR');
  const studentId=(samePerson&&cached.studentId&&/^[a-z0-9-]{12,90}$/i.test(cached.studentId))?cached.studentId:(globalThis.crypto?.randomUUID?.()||'student-'+Date.now()+'-'+Math.random().toString(36).slice(2));
  profile={name,code,studentId,group:'CPOP - Campo Mourão'};
  write('cpop.profile',{name,alias:samePerson?String(cached.alias||''):'',group:'CPOP - Campo Mourão',joinCode:code,studentId});
  write('cpop.mini.profile',profile);
  wait('Recuperando as respostas do Craft…');
  try{await loadStudent()}catch(err){fail(err,()=>loadStudent().catch(x=>fail(x,loadStudent)))}
 };
}
async function loadStudent(){
 const url=API+'&mode=student&studentId='+encodeURIComponent(profile.studentId)+'&code='+encodeURIComponent(profile.code);
 const info=await fetchJSON(url);
 bank=info;
 const local=stored('cpop.mini.draft.'+profile.studentId,null);
 finalized=info.progress?.final===true;
 if(finalized){
  answers=info.progress.answers||[];dirty=false;
  write('cpop.mini.draft.'+profile.studentId,{answers,dirty:false,updated:Date.now()});
  statusText='Entrega finalizada · confirmada no Craft';
 }else if(local?.dirty&&Array.isArray(local.answers)){
  answers=local.answers;dirty=true;statusText='Rascunho recuperado deste aparelho · envio pendente';
 }else if(info.progress){
  answers=info.progress.answers||[];dirty=false;statusText='Respostas recuperadas do Craft';
 }else{
  answers=local?.answers||[];dirty=false;statusText='Rascunho local · ainda não enviado';
 }
 for(const q of bank.questions)byId(q.id);
 position=Math.min(position,bank.questions.length-1);
 renderStudent();
 if(dirty)queueAutosave();
}
function renderStudent(){
 const statuses=countStatus(),completedNum=completed(),q=bank.questions[position],a=byId(q.id);
 APP.innerHTML='<div class="intro"><div><div class="eyebrow">REVISÃO FINAL · LINGUAGENS · 2026</div><h1>Seu mini-simulado.</h1><p>'+esc(profile.name)+' · CPOP - Campo Mourão</p></div><div class="row"><span class="chip '+(finalized?'good':'')+'">'+(finalized?'Entrega confirmada':bank.questions.length+' questões · 1 tentativa')+'</span><button id="changeName">Trocar participante</button></div></div>'+
 '<div class="quiz-layout"><aside class="sidebar card stack"><div class="row space"><strong>Seu progresso</strong><span data-progress-count>'+completedNum+'/'+bank.questions.length+'</span></div><div class="progressbar"><span style="width:'+Math.round(completedNum/bank.questions.length*100)+'%"></span></div><div class="numbers">'+statuses.map((s,i)=>'<button class="number '+s+(i===position?' selected':'')+'" data-jump="'+i+'" aria-label="Questão '+(i+1)+'">'+(i+1)+'</button>').join('')+'</div>'+
 '<p class="micro">Verde: alternativa selecionada. Amarelo: resposta apenas por comentário. Comentários podem acompanhar qualquer alternativa.</p><label class="row micro"><input type="checkbox" id="followTeacher" '+(follow?'checked':'')+'> Seguir projeção do professor</label><p id="syncStatus" class="status">'+esc(statusText)+'</p>'+
 (finalized?'<div class="note">Sua entrega está registrada no Craft. A devolutiva textual do professor pode ser consultada posteriormente nesta página.</div>':'<button id="finish" class="primary" '+(completedNum!==bank.questions.length?'disabled':'')+'>Finalizar e enviar</button>')+'</aside>'+
 '<section class="card question-card"><div class="row space"><span class="chip">Questão '+(position+1)+' de '+bank.questions.length+'</span><span class="chip" data-answer-status>'+(a.choice?'Alternativa '+String.fromCharCode(64+a.choice):a.comment.length>=8?'Comentário registrado':'Não respondida')+'</span></div><div class="line"></div>'+
 '<div class="qid">'+esc(q.title)+'</div><div class="stem">'+formatStem(q.body)+'</div>'+
 (q.image?'<figure><img src="'+esc(q.image)+'" alt="'+esc(q.alt||q.title)+'"><figcaption>'+esc(q.source)+'</figcaption></figure>':'')+
 '<fieldset class="choices" style="border:0;padding:0"><legend class="eyebrow" style="margin-bottom:8px">Selecione uma alternativa (opcional se comentar)</legend>'+
 q.options.map((o,i)=>'<label class="choice '+(a.choice===i+1?'checked':'')+'"><input type="radio" name="choice" value="'+(i+1)+'" '+(a.choice===i+1?'checked':'')+' '+(finalized?'disabled':'')+'><span class="letter">'+String.fromCharCode(65+i)+'</span><span>'+esc(o)+'</span></label>').join('')+'</fieldset>'+
 '<section class="comment-box"><label class="field">Seu comentário, justificativa ou resposta discursiva<textarea id="comment" '+(finalized?'readonly':'')+' maxlength="750" placeholder="Explique a evidência textual, justifique sua alternativa ou responda apenas por comentário (mínimo de 8 caracteres).">'+esc(a.comment||'')+'</textarea></label><p class="micro">O comentário será salvo no Craft e poderá receber uma devolutiva individual do professor.</p>'+
 (bank.progress?.feedback?.[q.id]?'<div class="note"><strong>Devolutiva do educador</strong><p>'+esc(bank.progress.feedback[q.id])+'</p></div>':'')+'</section>'+
 (finalized?'<div class="note">Entrega confirmada. '+(bank.progress?.correct!==null&&bank.progress?.correct!==undefined?'Acertos objetivos registrados: '+bank.progress.correct+'. ':'')+'Respostas apenas por comentário aguardam avaliação humana.</div>':'')+
 '<div class="question-foot"><button id="prev" '+(position===0?'disabled':'')+'>Anterior</button><span class="micro">Questão '+(position+1)+'/'+bank.questions.length+'</span><button id="next" class="primary" '+(position===bank.questions.length-1?'disabled':'')+'>Próxima</button></div></section></div>'+
 '<div class="student-mobile-bar" role="navigation" aria-label="Navegação entre questões"><button id="mobilePrev" '+(position===0?'disabled':'')+' aria-label="Questão anterior">Anterior</button><span data-mobile-progress>Questão '+(position+1)+'/'+bank.questions.length+'</span><button id="mobileNext" class="primary" '+(position===bank.questions.length-1?'disabled':'')+'>Próxima</button></div>';
 $('#changeName').onclick=()=>{
  clearTimeout(saveTimer);
  if(dirty)saveLocal();
  profile=null;bank=null;answers=[];finalized=false;dirty=false;position=0;
  profileForm();
 };
 const navigateTo=index=>{position=Math.max(0,Math.min(bank.questions.length-1,index));renderStudent();window.scrollTo({top:0,behavior:'instant'})};
 $('#app [data-jump]').forEach(b=>b.onclick=()=>navigateTo(Number(b.dataset.jump)));
 $('#followTeacher').onchange=e=>{follow=e.target.checked;write('cpop.mini.follow',follow)};
 $('#prev').onclick=()=>navigateTo(position-1);
 $('#next').onclick=()=>navigateTo(position+1);
 $('#mobilePrev').onclick=()=>navigateTo(position-1);
 $('#mobileNext').onclick=()=>navigateTo(position+1);
 if(!finalized){
  $('input[name="choice"]').forEach(i=>i.onchange=()=>{
   a.choice=Number(i.value);markDirty();
   $('.choices .choice').forEach(label=>label.classList.toggle('checked',label.querySelector('input')?.checked===true));
   updateStudentProgress();
  });
  $('#comment').oninput=e=>{
   a.comment=e.target.value;markDirty();updateStudentProgress();
  };
  $('#comment').onblur=()=>{const c=$('#syncStatus');if(c)c.textContent=statusText};
  $('#finish').onclick=finish;
 }
}
function updateStudentProgress(){
 if(!bank)return;
 const all=countStatus(),num=completed(),q=bank.questions[position],answer=byId(q.id);
 const count=$('[data-progress-count]');if(count)count.textContent=num+'/'+bank.questions.length;
 const progress=$('.sidebar .progressbar span');if(progress)progress.style.width=Math.round(num/bank.questions.length*100)+'%';
 const label=$('[data-answer-status]');if(label)label.textContent=answer.choice?'Alternativa '+String.fromCharCode(64+answer.choice):answer.comment.trim().length>=8?'Comentário registrado':'Não respondida';
 $('#app .number[data-jump]').forEach((btn,i)=>{btn.classList.toggle('done',all[i]==='done');btn.classList.toggle('comment-only',all[i]==='comment-only');});
 const finish=$('#finish');if(finish)finish.disabled=num!==bank.questions.length;
 const sync=$('#syncStatus');if(sync)sync.textContent=statusText;
}
function markDirty(){
 dirty=true;statusText='Alterações no aparelho · sincronização pendente';saveLocal();queueAutosave();
}
function queueAutosave(){
 clearTimeout(saveTimer);
 saveTimer=setTimeout(()=>enqueue(false),1700);
}
function enqueue(final){
 clearTimeout(saveTimer);
 const payload={code:profile.code,name:profile.name,studentId:profile.studentId,group:profile.group,version:bank.version,answers:bank.questions.map(q=>({...byId(q.id)})),final};
 statusText='Enviando ao Craft…';const status=$('#syncStatus');if(status)status.textContent=statusText;
 saveQueue=saveQueue.catch(()=>null).then(async()=>{
  try{
   const result=await req('POST',payload);
   const cache=stored('cpop.mini.draft.'+payload.studentId,{});
   if(JSON.stringify(cache.answers)===JSON.stringify(payload.answers)){
    write('cpop.mini.draft.'+payload.studentId,{answers:payload.answers,dirty:false,updated:Date.now()});
    if(profile?.studentId===payload.studentId)dirty=false;
   }
   statusText='Sincronizado no Craft · '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
   if(final&&profile?.studentId===payload.studentId){
    finalized=true;bank.progress={...bank.progress,final:true,correct:result.correct,answers:payload.answers};
    toast('Entrega confirmada no Craft.');renderStudent();
   }else if(profile?.studentId===payload.studentId){
    const s=$('#syncStatus');if(s)s.textContent=statusText;
   }
   return result;
  }catch(err){
   statusText='Não sincronizado · seu rascunho permanece neste aparelho';
   const s=$('#syncStatus');if(s)s.textContent=statusText;
   if(final&&profile?.studentId===payload.studentId)toast(err.message);throw err;
  }
 });
 return saveQueue;
}
async function finish(){
 const miss=bank.questions.findIndex(q=>{const a=byId(q.id);return !a.choice&&a.comment.trim().length<8});
 if(miss>=0){position=miss;renderStudent();toast('Responda esta questão por alternativa ou por comentário.');return;}
 const btn=$('#finish');if(btn)btn.disabled=true;
 try{await enqueue(true)}
 catch{
  try{
   const recovered=await fetchJSON(API+'&mode=student&studentId='+encodeURIComponent(profile.studentId)+'&code='+encodeURIComponent(profile.code));
   if(recovered.progress?.final){
    bank.progress=recovered.progress;answers=recovered.progress.answers||answers;finalized=true;dirty=false;
    write('cpop.mini.draft.'+profile.studentId,{answers,dirty:false,updated:Date.now()});
    statusText='Entrega finalizada · confirmada após reconexão ao Craft';
    renderStudent();toast('A entrega já havia sido registrada no Craft.');return;
   }
  }catch{}
  if(btn)btn.disabled=false;
 }
}
async function refreshFeedback(){
 if(MODE!=='aluno'||!profile||!finalized||document.hidden||!bank)return;
 try{
  const latest=await fetchJSON(API+'&mode=student&studentId='+encodeURIComponent(profile.studentId)+'&code='+encodeURIComponent(profile.code));
  const before=JSON.stringify(bank.progress?.feedback||{});
  if(latest.progress?.final&&JSON.stringify(latest.progress.feedback||{})!==before){
   bank.progress=latest.progress;answers=latest.progress.answers||answers;
   renderStudent();toast('Nova devolutiva do professor sincronizada.');
  }
 }catch{}
}
async function liveStudent(){
 if(MODE!=='aluno'||!profile||!bank||!follow||finalized||document.hidden)return;
 try{const j=await fetchJSON(API+'&mode=student');
  if(j.stage.active&&j.stage.number!==position+1&&document.activeElement?.tagName!=='TEXTAREA'){position=j.stage.number-1;renderStudent()}
 }catch{}
}
function teacherLogin(msg=''){
 APP.innerHTML='<section class="intro-form"><div class="eyebrow">ÁREA RESERVADA · CPOP</div><h1>Controle do mini-simulado.</h1><p class="muted">Respostas, comentários, devolutivas e projeção num único painel conectado ao Craft.</p><form id="teacherLogin" class="card stack"><label class="field">PIN do educador<input id="pin" type="password" inputmode="numeric" autocomplete="off" required></label><button class="primary">Entrar no painel</button><p class="danger">'+esc(msg)+'</p></form></section>';
 $('#teacherLogin').onsubmit=e=>{e.preventDefault();teacherToken=$('#pin').value;sessionStorage.setItem('cpop.teacher.token',teacherToken);loadTeacher()};
}
async function loadTeacher(){
 if(!teacherToken){teacherLogin();return;}
 try{
  tData=await fetchJSON(API+'&mode=teacher',{headers:{Authorization:'Bearer '+teacherToken}});
  renderTeacher();
 }catch(e){if(e.status===401){teacherToken='';sessionStorage.removeItem('cpop.teacher.token');teacherLogin('PIN incorreto ou sessão expirada.')}else fail(e,loadTeacher)}
}
function teacherCounts(idx){
 let total=0,correct=0,comments=0;
 const choices=tData.questions[idx].options.map(()=>0);
 for(const row of tData.records){
  const a=row.answers[idx];if(!a)continue;
  if(a.choice>0){total++;if(choices[a.choice-1]!==undefined)choices[a.choice-1]++;if(a.choice===tData.questions[idx].answer)correct++;}
  if(a.comment)comments++;
 }
 return {total,correct,comments,choices};
}

function exportTeacherCSV(){
 if(!tData)return;
 const rows=[['Identificador','Nome completo','Turma','Situação da tentativa','Questão','Identificador da questão','Alternativa','Gabarito objetivo','Acerto objetivo','Comentário do estudante','Devolutiva do professor','Data de atualização','Versão da atividade']];
 for(const record of tData.records){
  for(const [i,q] of tData.questions.entries()){
   const response=record.answers[i]||{},choice=Number(response.choice)||0;
   rows.push([record.studentId,record.name,record.group,record.final?'Finalizada':'Rascunho',i+1,q.id,choice?String.fromCharCode(64+choice):'',String.fromCharCode(64+q.answer),choice?choice===q.answer?'Sim':'Não':'Pendente de correção textual',response.comment||'',record.feedback?.[q.id]||'',record.updated||'',record.savedVersion||'']);
  }
 }
 const quote=x=>{
  let value=String(x??'').replace(/\r/g,' ');
  if(/^\s*[=+\-@]/.test(value)||value.startsWith('\t'))value="'"+value;
  return '"'+value.replace(/"/g,'""')+'"';
 };
 const csv='\ufeff'+rows.map(row=>row.map(quote).join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='cpop-mini-linguagens-'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
 toast('Exportação preparada: '+tData.records.length+' participantes.');
}
function applyTeacherFilters(){
 const query=teacherView.query.trim().toLocaleLowerCase('pt-BR');let visible=0;
 $('.student-card[data-student-name]').forEach(card=>{
  const searchOk=!query||card.dataset.studentName.includes(query);
  const modeOk=teacherView.mode==='all'||teacherView.mode==='comments'&&card.dataset.hasComment==='yes'||teacherView.mode==='pending'&&card.dataset.needsFeedback==='yes';
  card.hidden=!(searchOk&&modeOk);
  if(!card.hidden)visible++;
 });
 const count=$('#teacherFilterCount');if(count)count.textContent=visible+' de '+(tData?.records.length||0)+' participantes';
 $('[data-teacher-filter]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.teacherFilter===teacherView.mode)));
 const empty=$('#teacherNoMatches');if(empty)empty.hidden=visible!==0;
}


function showClock(seconds){
 const value=Math.max(0,Math.ceil(seconds));
 return String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');
}
function clockSync(clock){
 if(!clock)return;
 const duration=Number(clock.duration)||120;
 let remainingMs=Math.max(0,(Number(clock.remaining)||0)*1000);
 if(clock.running&&clock.deadline&&clock.serverTime){
  remainingMs=Math.max(0,Date.parse(clock.deadline)-Date.parse(clock.serverTime));
 }
 clockBase={duration,remainingMs,receivedAt:performance.now(),running:clock.running===true};
 clockTick();
}
function clockTick(){
 if(!clockBase)return;
 const ms=Math.max(0,clockBase.remainingMs-(clockBase.running?performance.now()-clockBase.receivedAt:0));
 const seconds=Math.ceil(ms/1000);
 for(const id of ['teacherClock','projectionClock']){
  const node=document.getElementById(id);
  if(node){node.textContent=showClock(seconds);node.classList.toggle('elapsed',seconds===0);node.setAttribute('aria-label',seconds===0?'Tempo encerrado':'Tempo restante: '+showClock(seconds));}
 }
 const status=document.getElementById('teacherTimerStatus');
 if(status)status.textContent=seconds===0?'Tempo encerrado':clockBase.running?'Cronômetro em andamento':'Cronômetro pausado';
}
function snapshotKey(obj){
 const copy=JSON.parse(JSON.stringify(obj));
 if(copy.stage?.clock){delete copy.stage.clock.serverTime;delete copy.stage.clock.remaining;}
 return JSON.stringify(copy);
}

function renderTeacher(){
 const q=tData.questions[tPosition],stage=tData.stage,records=tData.records,submitted=records.filter(r=>r.final),c=teacherCounts(tPosition);
 APP.innerHTML='<div class="intro"><div><div class="eyebrow">PAINEL DOCENTE · CPOP</div><h1>Mini-simulado · gestão da turma.</h1><p>Respostas comentadas, correção, projeção e armazenamento institucional Craft.</p></div><div class="row"><span class="chip good">Craft conectado</span><a class="btn" href="/minisimulado.html?modo=projecao" target="_blank" rel="noopener">Abrir projeção</a><button id="downloadTeacherCSV" title="Exportar respostas com comentários e devolutivas">Exportar CSV</button><button id="reloadTeacher">Atualizar</button></div></div>'+
 '<div class="stats"><div class="stat"><strong>'+records.length+'</strong><span>Participantes iniciados</span></div><div class="stat"><strong>'+submitted.length+'</strong><span>Entregas finalizadas</span></div><div class="stat"><strong>'+c.total+'</strong><span>Alternativas na questão</span></div><div class="stat"><strong>'+c.comments+'</strong><span>Comentários na questão</span></div></div>'+
 '<div class="line"></div><div class="teacher-grid"><section class="teacher-rows"><div class="card"><div class="row space"><div><div class="eyebrow">TRANSMISSÃO · QUESTÃO '+(tPosition+1)+'/'+tData.questions.length+'</div><h2>'+esc(q.title)+'</h2></div><span class="chip '+(stage.active?'good':'')+'">'+(stage.active?'Ao vivo · questão '+stage.number:'Projeção pausada')+'</span></div>'+
 '<div class="numbers">'+tData.questions.map((x,i)=>'<button class="number '+(i===tPosition?'selected':'')+'" data-teacher-jump="'+i+'">'+(i+1)+'</button>').join('')+'</div><div class="line"></div>'+
 '<div class="row"><button class="primary" id="projectQuestion">Projetar esta questão</button><button id="liveToggle">'+(stage.active?'Pausar':'Iniciar transmissão')+'</button><button id="revealToggle">'+(stage.reveal?'Ocultar gabarito':'Revelar gabarito')+'</button><button id="hideProjectedComment" '+(!stage.projectedComment?'disabled':'')+'>Ocultar comentário projetado</button></div>'+(stage.projectedComment?'<div class="projected-status"><strong>Comentário no telão:</strong> '+esc(stage.projectedComment)+'</div>':'')+'<p class="micro">A projeção consulta o estado no Craft periodicamente. Alterar esta questão não apaga as respostas dos alunos.</p>'+
 '<div class="timer-controls"><div><div class="eyebrow">CRONÔMETRO · QUESTÃO</div><output id="teacherClock" class="timer-display">--:--</output><p class="micro" id="teacherTimerStatus">Sincronizando…</p></div><div class="timer-settings"><label class="field" for="teacherTimerDuration">Duração por questão<select id="teacherTimerDuration">'+[30,60,90,120,180,300,600,900].map(n=>'<option value="'+n+'" '+(stage.clock?.duration===n?'selected':'')+'>'+showClock(n)+'</option>').join('')+'</select></label><div class="row"><button id="teacherTimerStart" class="primary">'+(stage.clock?.running?'Em andamento':'Iniciar / retomar')+'</button><button id="teacherTimerPause" '+(!stage.clock?.running?'disabled':'')+'>Pausar</button><button id="teacherTimerReset">Reiniciar</button></div></div><p class="micro">Tempo orientativo e sincronizado pelo Craft. Não finaliza respostas automaticamente.</p></div>'+
 '<div class="note"><strong>Gabarito docente:</strong> '+String.fromCharCode(64+q.answer)+' · '+esc(q.why)+'</div></div>'+
 '<div class="card"><h3>Distribuição de respostas · questão '+(tPosition+1)+'</h3><div class="distribution">'+c.choices.map((n,i)=>'<div class="barrow"><span>'+String.fromCharCode(65+i)+'</span><div class="bar"><span style="width:'+Math.round(n/Math.max(c.total,1)*100)+'%"></span></div><span>'+n+'</span></div>').join('')+'</div><p class="micro">'+c.correct+' acertos em '+c.total+' alternativas registradas. Comentários sem alternativa requerem avaliação humana; nenhuma pontuação TRI é estimada.</p></div>'+
 '<div class="card"><h3>Projeção nesta mesma tela</h3><iframe class="presenter-frame" title="Projeção sincronizada" src="/minisimulado.html?modo=projecao&embed=1"></iframe></div></section>'+
 '<section class="card"><div class="row space"><h2>Respostas da questão '+(tPosition+1)+'</h2><span class="chip">'+records.length+' registros</span></div><p class="micro">Respostas e comentários aparecem à medida que são sincronizados, mesmo antes da entrega final.</p>'+
 '<div class="teacher-filters"><label class="field">Localizar estudante<input id="teacherSearch" type="search" autocomplete="off" value="'+esc(teacherView.query)+'" placeholder="Nome ou parte do nome"></label><div class="row"><button type="button" data-teacher-filter="all" aria-pressed="true">Todos</button><button type="button" data-teacher-filter="comments" aria-pressed="false">Com comentários</button><button type="button" data-teacher-filter="pending" aria-pressed="false">Aguardando devolutiva</button></div><span id="teacherFilterCount" class="micro"></span></div>'+
 '<div class="teacher-responses">'+(records.length?records.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(row=>{
  const a=row.answers[tPosition]||{choice:0,comment:''},mark=a.choice?(a.choice===q.answer?'Correta':'Incorreta'):'Sem alternativa';
  return '<article class="student-card" data-student-name="'+esc(String(row.name||'').toLocaleLowerCase('pt-BR'))+'" data-has-comment="'+(a.comment?'yes':'no')+'" data-needs-feedback="'+(a.comment&&!row.feedback?.[q.id]?'yes':'no')+'"><div class="row space"><strong>'+esc(row.name)+'</strong><span class="chip '+(row.final?'good':'')+'">'+(row.final?'Enviado':'Rascunho')+'</span></div>'+
  '<div class="micro">'+(a.choice?'Alternativa '+String.fromCharCode(64+a.choice)+' · '+mark:'Somente comentário / não respondida')+'</div>'+
  (a.comment?'<p>'+esc(a.comment)+'</p><details class="comment-moderation"><summary>Selecionar para projeção anônima</summary><label class="field">Texto a projetar (revise e remova nomes ou informações privadas)<textarea data-project-text="'+esc(row.id)+'" maxlength="700" placeholder="Trecho para discussão coletiva">'+esc(a.comment.slice(0,700))+'</textarea></label><button data-project-submit="'+esc(row.id)+'">Projetar texto revisado</button><p class="micro">Exibição pública apenas após confirmação docente. O nome do aluno não é enviado ao telão.</p></details>':'<p class="micro">Nenhum comentário registrado.</p>')+
  '<label class="field">Devolutiva ao estudante<textarea data-feedback="'+esc(row.id)+'" maxlength="1200" placeholder="Escreva uma devolutiva individual para esta questão…">'+esc(row.feedback?.[q.id]||'')+'</textarea></label><button data-save-feedback="'+esc(row.id)+'">Salvar devolutiva no Craft</button></article>';
 }).join(''):'<p class="muted">Ainda não há respostas sincronizadas.</p>')+'<p id="teacherNoMatches" class="muted" hidden>Nenhum registro corresponde aos filtros.</p></div></section></div>';
 clockSync(stage.clock);
 $('#reloadTeacher').onclick=loadTeacher;
 $('#teacherTimerDuration').onchange=e=>timerAction('set',Number(e.target.value));
 $('#teacherTimerStart').onclick=()=>timerAction('start');
 $('#teacherTimerPause').onclick=()=>timerAction('pause');
 $('#teacherTimerReset').onclick=()=>timerAction('reset');
 $('#downloadTeacherCSV').onclick=exportTeacherCSV;
 $('#teacherSearch').oninput=e=>{teacherView.query=e.target.value;applyTeacherFilters()};
 $('[data-teacher-filter]').forEach(btn=>btn.onclick=()=>{teacherView.mode=btn.dataset.teacherFilter;applyTeacherFilters()});
 applyTeacherFilters();
 $$('[data-teacher-jump]').forEach(b=>b.onclick=()=>{tPosition=Number(b.dataset.teacherJump);renderTeacher()});
 $('#projectQuestion').onclick=()=>setStage({number:tPosition+1,active:true,reveal:false});
 $('#liveToggle').onclick=()=>setStage({number:stage.number,active:!stage.active,reveal:stage.reveal});
 $('#revealToggle').onclick=()=>setStage({number:stage.number,active:stage.active,reveal:!stage.reveal});
 $('#hideProjectedComment').onclick=async()=>{
  try{
   const r=await req('POST',{action:'project-comment',show:false},true);
   tData.stage=r.stage;renderTeacher();toast('Comentário ocultado no telão.');
  }catch(e){toast(e.message)}
 };
 $('[data-project-submit]').forEach(btn=>btn.onclick=async()=>{
  const rowId=btn.dataset.projectSubmit,box=$('[data-project-text="'+rowId+'"]');
  const value=box?.value.trim()||'';
  if(value.length<8||value.length>700){toast('Revise o texto: utilize entre 8 e 700 caracteres.');return}
  if(!window.confirm('Projetar este comentário publicamente? Confirme que retirou nomes e informações pessoais do texto.'))return;
  btn.disabled=true;
  try{
   const r=await req('POST',{action:'project-comment',show:true,rowId,questionId:q.id,text:value},true);
   tData.stage=r.stage;tPosition=r.stage.number-1;renderTeacher();toast('Comentário selecionado e exibido sem identificação no telão.');
  }catch(e){toast(e.message);btn.disabled=false}
 });
 $('[data-save-feedback]').forEach(btn=>btn.onclick=async()=>{
   const rowId=btn.dataset.saveFeedback,box=$('[data-feedback="'+rowId+'"]');btn.disabled=true;
   try{await req('POST',{action:'feedback',rowId,questionId:q.id,comment:box.value},true);toast('Devolutiva sincronizada no Craft.');await loadTeacher();}
   catch(e){toast(e.message);btn.disabled=false;}
 });
}
async function timerAction(op,seconds){
 const button=op==='start'?$('#teacherTimerStart'):op==='pause'?$('#teacherTimerPause'):op==='reset'?$('#teacherTimerReset'):$('#teacherTimerDuration');
 if(button)button.disabled=true;
 try{
  const result=await req('POST',{action:'timer',op,...(seconds?{seconds}:{})},true);
  tData.stage=result.stage;renderTeacher();toast('Cronômetro sincronizado no Craft.');
 }catch(e){toast(e.message);if(button)button.disabled=false}
}
async function setStage(data){
 try{const j=await req('PUT',data,true);tData.stage=j.stage;renderTeacher();toast('Projeção sincronizada no Craft.')}catch(e){toast(e.message)}
}
async function teacherPoll(){
 if(MODE!=='professor'||!tData||document.hidden||document.activeElement?.tagName==='TEXTAREA')return;
 try{
  const j=await fetchJSON(API+'&mode=teacher',{headers:{Authorization:'Bearer '+teacherToken}});
  const before=snapshotKey({rows:tData.records,stage:tData.stage}),after=snapshotKey({rows:j.records,stage:j.stage});
  if(before!==after){tData=j;renderTeacher();}
 }catch{}
}
async function projectionLoad(){
 try{
  const j=await fetchJSON(API+'&mode=projection');
  const hash=snapshotKey(j);
  if(hash!==snapshot){snapshot=hash;renderProjection(j);}
 }catch(e){if(!snapshot)fail(e,projectionLoad)}
}
function renderProjection(j){
 const q=j.question,s=j.stage,d=j.distribution;
 clockSync(s.clock);
 APP.innerHTML='<div class="projection-shell"><div class="intro"><div><div class="eyebrow">CP֍P · LINGUAGENS · PROJEÇÃO</div><h1>Revisão final · questão '+s.number+'/'+j.total+'</h1></div><div class="row"><span class="badge-big">'+(s.active?'EM APRESENTAÇÃO':'TRANSMISSÃO PAUSADA')+'</span><span class="chip">'+d.started+' participantes</span><div class="projection-timer"><span class="micro">TEMPO RESTANTE</span><output id="projectionClock" class="timer-display" aria-live="off">--:--</output></div></div></div>'+
 '<div class="projection-main"><article class="card question-card">'+renderQuestion(q,s.number,s.reveal?s.answer:0,s.reveal,s.answer)+(s.reveal?'<div class="note"><h3>Gabarito · '+String.fromCharCode(64+j.answer)+'</h3><p>'+esc(j.why)+'</p></div>':'')+(s.active&&j.projectedComment?'<section class="projected-comment"><div class="eyebrow">RESPOSTA DISCURSIVA · SELEÇÃO DOCENTE</div><blockquote>'+esc(j.projectedComment)+'</blockquote><p>Comentário exibido sem identificação do participante.</p></section>':'')+'</article>'+
 '<aside class="card stack"><div class="eyebrow">PAINEL DE SALA</div><h2>'+d.submitted+' entregas finalizadas</h2><p class="muted">'+d.started+' participantes iniciaram a atividade no Craft.</p><div class="line"></div>'+
 (s.reveal?'<h3>Respostas agregadas</h3><div class="distribution">'+q.options.map((o,i)=>'<div class="barrow"><span>'+String.fromCharCode(65+i)+'</span><div class="bar"><span style="width:'+Math.round(d.counts[i]/Math.max(1,d.counts.reduce((a,b)=>a+b,0))*100)+'%"></span></div><span>'+d.counts[i]+'</span></div>').join('')+'</div>':'<p class="muted">As escolhas da turma permanecem ocultas até a revelação do gabarito.</p>')+
 '<div class="note"><strong>'+d.comments+' comentários</strong><p class="micro">O professor pode selecionar um comentário para projeção sem identificar o participante.</p></div></aside></div></div>';
}
function beginWithSharedProfile(){
 const shared=sharedProfile();
 if(!shared)return false;
 profile={name:shared.name,code:shared.joinCode,studentId:shared.studentId,group:shared.group};
 write('cpop.mini.profile',profile);
 wait('Recuperando seu mini-simulado no Craft…');
 loadStudent().catch(err=>{profile=null;bank=null;profileForm();toast('Confira seu acesso: '+(err.message||'consulta indisponível'));});
 return true;
}
if(MODE==='professor'){loadTeacher();}
else if(MODE==='projecao'){projectionLoad();setInterval(projectionLoad,5000);}
else{if(!beginWithSharedProfile())profileForm();setInterval(liveStudent,8000);setInterval(refreshFeedback,15000);}
if(MODE==='professor')setInterval(teacherPoll,8000);
setInterval(clockTick,250);
})();