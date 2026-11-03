(() => {
'use strict';
const APP=document.getElementById('app'), TOAST=document.getElementById('toast');
const MODE=new URLSearchParams(location.search).get('modo')||'aluno';
const ID='mini-linguagens-2026-11', API='/api/minisimulado';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stored=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k))??fallback}catch{return fallback}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const $=(s,base=document)=>base.querySelector(s);
const $$=(s,base=document)=>[...base.querySelectorAll(s)];
const safeNumber=x=>Number.isFinite(Number(x))?Number(x):0;
let bank=null,profile=null,answers=[],position=0,finalized=false,dirty=false,saveTimer=null,saveQueue=Promise.resolve(),statusText='',
    teacherToken=sessionStorage.getItem('cpop.teacher.token')||'',tData=null,tPosition=0,follow=stored('cpop.mini.follow',false),snapshot='';
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
 return '<div class="qid">QUESTÃO '+String(number).padStart(2,'0')+' · '+esc(q.title)+'</div><div class="stem">'+esc(q.body)+'</div>'+
  (q.image?'<figure><img src="'+esc(q.image)+'" loading="lazy" alt="'+esc(q.alt||q.title)+'"><figcaption>'+esc(q.source||'Acervo CPOP')+'</figcaption></figure>':'')+
  '<div class="choices">'+q.options.map((o,i)=>'<div class="choice '+(selected===i+1?'checked':'')+'" '+(showCorrect&&correct===i+1?'style="border-color:var(--green)"':'')+'><span class="letter">'+String.fromCharCode(65+i)+'</span><span>'+esc(o)+'</span></div>').join('')+'</div>'+
  '<p class="micro">Fonte: '+esc(q.source||'Banco canônico do CPOP')+'</p>';
}
function saveLocal(){if(!profile)return;write('cpop.mini.draft.'+profile.studentId,{answers,dirty:true,updated:Date.now()});}
function byId(id){let a=answers.find(x=>x.id===id);if(!a){a={id,choice:0,comment:''};answers.push(a);}return a;}
function completed(){return bank.questions.filter(q=>{let a=byId(q.id);return a.choice>0||a.comment.trim().length>=8}).length;}
function countStatus(){return bank.questions.map(q=>{const a=byId(q.id);return a.choice?'done':a.comment.trim().length>=8?'comment-only':''})}
function profileForm(){
 const cached=stored('cpop.mini.profile',null)||stored('cpop.profile',{})||{};
 APP.innerHTML='<section class="intro-form"><div class="eyebrow">CPOP · Campo Mourão</div><h1>Mini-simulado de Linguagens.</h1><p class="muted">15 questões do acervo Craft, com alternativas e comentários. Responda pelo celular; cada envio confirmado fica disponível no painel do educador.</p><div class="card"><form id="join" class="stack"><label class="field">Nome completo<input name="name" value="'+esc(cached.name||'')+'" autocomplete="name" maxlength="120" required></label><label class="field">Turma<input value="CPOP - Campo Mourão" readonly></label><label class="field">Código de participação<input name="code" type="password" value="'+esc(cached.code||cached.joinCode||'')+'" required autocomplete="off"></label><button class="primary" type="submit">Entrar no mini-simulado</button><p class="micro">A senha do Craft não é solicitada. O código da turma apenas autoriza o envio; os comentários são visíveis ao educador.</p></form></div></section>';
 $('#join').onsubmit=async e=>{
  e.preventDefault();
  const form=e.target;
  const name=form.elements.name.value.trim().replace(/\s+/g,' '),code=form.elements.code.value.trim();
  if(name.length<4||!code){toast('Informe nome completo e código.');return}
  const studentId=(cached.studentId&&/^[a-z0-9-]{12,90}$/i.test(cached.studentId))?cached.studentId:(globalThis.crypto?.randomUUID?.()||'student-'+Date.now()+'-'+Math.random().toString(36).slice(2));
  profile={name,code,studentId,group:'CPOP - Campo Mourão'};
  write('cpop.mini.profile',profile);
  wait('Recuperando as respostas do Craft…');
  try{await loadStudent()}catch(err){fail(err,()=>loadStudent().catch(x=>fail(x,loadStudent)))}
 };
}
async function loadStudent(){
 const url=API+'?mode=student&studentId='+encodeURIComponent(profile.studentId)+'&code='+encodeURIComponent(profile.code);
 const info=await fetchJSON(url);
 bank=info;
 const local=stored('cpop.mini.draft.'+profile.studentId,null);
 if(local?.dirty&&Array.isArray(local.answers)){answers=local.answers;dirty=true;statusText='Rascunho recuperado deste aparelho · envio pendente';}
 else if(info.progress){answers=info.progress.answers||[];finalized=info.progress.final;statusText='Respostas recuperadas do Craft';}
 else{answers=local?.answers||[];statusText='Rascunho local · ainda não enviado';}
 for(const q of bank.questions)byId(q.id);
 position=Math.min(position,bank.questions.length-1);
 renderStudent();
 if(dirty)queueAutosave();
}
function renderStudent(){
 const statuses=countStatus(),completedNum=completed(),q=bank.questions[position],a=byId(q.id);
 APP.innerHTML='<div class="intro"><div><div class="eyebrow">REVISÃO FINAL · LINGUAGENS · 2026</div><h1>Seu mini-simulado.</h1><p>'+esc(profile.name)+' · CPOP - Campo Mourão</p></div><div class="row"><span class="chip '+(finalized?'good':'')+'">'+(finalized?'Entrega confirmada':'15 questões · 1 tentativa')+'</span><button id="changeName">Trocar participante</button></div></div>'+
 '<div class="quiz-layout"><aside class="sidebar card stack"><div class="row space"><strong>Seu progresso</strong><span>'+completedNum+'/15</span></div><div class="progressbar"><span style="width:'+Math.round(completedNum/15*100)+'%"></span></div><div class="numbers">'+statuses.map((s,i)=>'<button class="number '+s+(i===position?' selected':'')+'" data-jump="'+i+'" aria-label="Questão '+(i+1)+'">'+(i+1)+'</button>').join('')+'</div>'+
 '<p class="micro">Verde: alternativa selecionada. Amarelo: resposta apenas por comentário. Comentários podem acompanhar qualquer alternativa.</p><label class="row micro"><input type="checkbox" id="followTeacher" '+(follow?'checked':'')+'> Seguir projeção do professor</label><p id="syncStatus" class="status">'+esc(statusText)+'</p>'+
 (finalized?'<div class="note">Sua entrega está registrada no Craft. A devolutiva textual do professor pode ser consultada posteriormente nesta página.</div>':'<button id="finish" class="primary" '+(completedNum!==15?'disabled':'')+'>Finalizar e enviar</button>')+'</aside>'+
 '<section class="card question-card"><div class="row space"><span class="chip">Questão '+(position+1)+' de 15</span><span class="chip">'+(a.choice?'Alternativa '+String.fromCharCode(64+a.choice):a.comment.length>=8?'Comentário registrado':'Não respondida')+'</span></div><div class="line"></div>'+
 '<div class="qid">'+esc(q.title)+'</div><div class="stem">'+esc(q.body)+'</div>'+
 (q.image?'<figure><img src="'+esc(q.image)+'" alt="'+esc(q.alt||q.title)+'"><figcaption>'+esc(q.source)+'</figcaption></figure>':'')+
 '<fieldset class="choices" style="border:0;padding:0"><legend class="eyebrow" style="margin-bottom:8px">Selecione uma alternativa (opcional se comentar)</legend>'+
 q.options.map((o,i)=>'<label class="choice '+(a.choice===i+1?'checked':'')+'"><input type="radio" name="choice" value="'+(i+1)+'" '+(a.choice===i+1?'checked':'')+' '+(finalized?'disabled':'')+'><span class="letter">'+String.fromCharCode(65+i)+'</span><span>'+esc(o)+'</span></label>').join('')+'</fieldset>'+
 '<section class="comment-box"><label class="field">Seu comentário, justificativa ou resposta discursiva<textarea id="comment" '+(finalized?'readonly':'')+' maxlength="750" placeholder="Explique a evidência textual, justifique sua alternativa ou responda apenas por comentário (mínimo de 8 caracteres).">'+esc(a.comment||'')+'</textarea></label><p class="micro">O comentário será salvo no Craft e poderá receber uma devolutiva individual do professor.</p>'+
 (bank.progress?.feedback?.[q.id]?'<div class="note"><strong>Devolutiva do educador</strong><p>'+esc(bank.progress.feedback[q.id])+'</p></div>':'')+'</section>'+
 (finalized?'<div class="note">Entrega confirmada. '+(bank.progress?.correct!==null&&bank.progress?.correct!==undefined?'Acertos objetivos registrados: '+bank.progress.correct+'. ':'')+'Respostas apenas por comentário aguardam avaliação humana.</div>':'')+
 '<div class="question-foot"><button id="prev" '+(position===0?'disabled':'')+'>Anterior</button><span class="micro">Questão '+(position+1)+'/15</span><button id="next" class="primary" '+(position===14?'disabled':'')+'>Próxima</button></div></section></div>';
 $('#changeName').onclick=()=>{profile=null;profileForm()};
 $$('#app [data-jump]').forEach(b=>b.onclick=()=>{position=Number(b.dataset.jump);renderStudent()});
 $('#followTeacher').onchange=e=>{follow=e.target.checked;write('cpop.mini.follow',follow)};
 $('#prev').onclick=()=>{position=Math.max(0,position-1);renderStudent()};
 $('#next').onclick=()=>{position=Math.min(14,position+1);renderStudent()};
 if(!finalized){
  $$('input[name="choice"]').forEach(i=>i.onchange=()=>{
   a.choice=Number(i.value);markDirty();renderStudent();
  });
  $('#comment').oninput=e=>{
   a.comment=e.target.value;markDirty();const s=$('#syncStatus');if(s)s.textContent=statusText;
  };
  $('#comment').onblur=()=>{const c=$('#syncStatus');if(c)c.textContent=statusText};
  $('#finish').onclick=finish;
 }
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
   const cache=stored('cpop.mini.draft.'+profile.studentId,{});
   if(JSON.stringify(cache.answers)===JSON.stringify(payload.answers)){write('cpop.mini.draft.'+profile.studentId,{answers:payload.answers,dirty:false,updated:Date.now()});dirty=false;}
   statusText='Sincronizado no Craft · '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
   if(final){finalized=true;bank.progress={...bank.progress,final:true,correct:result.correct,answers:payload.answers};toast('Entrega confirmada no Craft.');renderStudent();}
   else{const s=$('#syncStatus');if(s)s.textContent=statusText;}
   return result;
  }catch(err){
   statusText='Não sincronizado · seu rascunho permanece neste aparelho';
   const s=$('#syncStatus');if(s)s.textContent=statusText;
   if(final)toast(err.message);throw err;
  }
 });
 return saveQueue;
}
async function finish(){
 const miss=bank.questions.findIndex(q=>{const a=byId(q.id);return !a.choice&&a.comment.trim().length<8});
 if(miss>=0){position=miss;renderStudent();toast('Responda esta questão por alternativa ou por comentário.');return;}
 const btn=$('#finish');if(btn)btn.disabled=true;
 try{await enqueue(true)}catch{if(btn)btn.disabled=false;}
}
async function liveStudent(){
 if(MODE!=='aluno'||!profile||!bank||!follow||finalized||document.hidden)return;
 try{const j=await fetchJSON(API+'?mode=student');
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
  tData=await fetchJSON(API+'?mode=teacher',{headers:{Authorization:'Bearer '+teacherToken}});
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
function renderTeacher(){
 const q=tData.questions[tPosition],stage=tData.stage,records=tData.records,submitted=records.filter(r=>r.final),c=teacherCounts(tPosition);
 APP.innerHTML='<div class="intro"><div><div class="eyebrow">PAINEL DOCENTE · CPOP</div><h1>Mini-simulado · gestão da turma.</h1><p>Respostas comentadas, correção, projeção e armazenamento institucional Craft.</p></div><div class="row"><span class="chip good">Craft conectado</span><a class="btn" href="/minisimulado.html?modo=projecao" target="_blank" rel="noopener">Abrir projeção</a><button id="reloadTeacher">Atualizar</button></div></div>'+
 '<div class="stats"><div class="stat"><strong>'+records.length+'</strong><span>Participantes iniciados</span></div><div class="stat"><strong>'+submitted.length+'</strong><span>Entregas finalizadas</span></div><div class="stat"><strong>'+c.total+'</strong><span>Alternativas na questão</span></div><div class="stat"><strong>'+c.comments+'</strong><span>Comentários na questão</span></div></div>'+
 '<div class="line"></div><div class="teacher-grid"><section class="teacher-rows"><div class="card"><div class="row space"><div><div class="eyebrow">TRANSMISSÃO · QUESTÃO '+(tPosition+1)+'/15</div><h2>'+esc(q.title)+'</h2></div><span class="chip '+(stage.active?'good':'')+'">'+(stage.active?'Ao vivo · questão '+stage.number:'Projeção pausada')+'</span></div>'+
 '<div class="numbers">'+tData.questions.map((x,i)=>'<button class="number '+(i===tPosition?'selected':'')+'" data-teacher-jump="'+i+'">'+(i+1)+'</button>').join('')+'</div><div class="line"></div>'+
 '<div class="row"><button class="primary" id="projectQuestion">Projetar esta questão</button><button id="liveToggle">'+(stage.active?'Pausar':'Iniciar transmissão')+'</button><button id="revealToggle">'+(stage.reveal?'Ocultar gabarito':'Revelar gabarito')+'</button></div><p class="micro">A projeção consulta o estado no Craft periodicamente. Alterar esta questão não apaga as respostas dos alunos.</p>'+
 '<div class="note"><strong>Gabarito docente:</strong> '+String.fromCharCode(64+q.answer)+' · '+esc(q.why)+'</div></div>'+
 '<div class="card"><h3>Distribuição de respostas · questão '+(tPosition+1)+'</h3><div class="distribution">'+c.choices.map((n,i)=>'<div class="barrow"><span>'+String.fromCharCode(65+i)+'</span><div class="bar"><span style="width:'+Math.round(n/Math.max(c.total,1)*100)+'%"></span></div><span>'+n+'</span></div>').join('')+'</div><p class="micro">'+c.correct+' acertos em '+c.total+' alternativas registradas. Comentários sem alternativa requerem avaliação humana; nenhuma pontuação TRI é estimada.</p></div>'+
 '<div class="card"><h3>Projeção nesta mesma tela</h3><iframe class="presenter-frame" title="Projeção sincronizada" src="/minisimulado.html?modo=projecao&embed=1"></iframe></div></section>'+
 '<section class="card"><div class="row space"><h2>Respostas da questão '+(tPosition+1)+'</h2><span class="chip">'+records.length+' registros</span></div><p class="micro">Respostas e comentários aparecem à medida que são sincronizados, mesmo antes da entrega final.</p>'+
 '<div class="teacher-responses">'+(records.length?records.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(row=>{
  const a=row.answers[tPosition]||{choice:0,comment:''},mark=a.choice?(a.choice===q.answer?'Correta':'Incorreta'):'Sem alternativa';
  return '<article class="student-card"><div class="row space"><strong>'+esc(row.name)+'</strong><span class="chip '+(row.final?'good':'')+'">'+(row.final?'Enviado':'Rascunho')+'</span></div>'+
  '<div class="micro">'+(a.choice?'Alternativa '+String.fromCharCode(64+a.choice)+' · '+mark:'Somente comentário / não respondida')+'</div>'+
  (a.comment?'<p>'+esc(a.comment)+'</p>':'<p class="micro">Nenhum comentário registrado.</p>')+
  '<label class="field">Devolutiva ao estudante<textarea data-feedback="'+esc(row.id)+'" maxlength="1200" placeholder="Escreva uma devolutiva individual para esta questão…">'+esc(row.feedback?.[q.id]||'')+'</textarea></label><button data-save-feedback="'+esc(row.id)+'">Salvar devolutiva no Craft</button></article>';
 }).join(''):'<p class="muted">Ainda não há respostas sincronizadas.</p>')+'</div></section></div>';
 $('#reloadTeacher').onclick=loadTeacher;
 $$('[data-teacher-jump]').forEach(b=>b.onclick=()=>{tPosition=Number(b.dataset.teacherJump);renderTeacher()});
 $('#projectQuestion').onclick=()=>setStage({number:tPosition+1,active:true,reveal:false});
 $('#liveToggle').onclick=()=>setStage({number:stage.number,active:!stage.active,reveal:stage.reveal});
 $('#revealToggle').onclick=()=>setStage({number:stage.number,active:stage.active,reveal:!stage.reveal});
 $$('[data-save-feedback]').forEach(btn=>btn.onclick=async()=>{
   const rowId=btn.dataset.saveFeedback,box=$('[data-feedback="'+rowId+'"]');btn.disabled=true;
   try{await req('POST',{action:'feedback',rowId,questionId:q.id,comment:box.value},true);toast('Devolutiva sincronizada no Craft.');await loadTeacher();}
   catch(e){toast(e.message);btn.disabled=false;}
 });
}
async function setStage(data){
 try{const j=await req('PUT',data,true);tData.stage=j.stage;renderTeacher();toast('Projeção sincronizada no Craft.')}catch(e){toast(e.message)}
}
async function teacherPoll(){
 if(MODE!=='professor'||!tData||document.hidden||document.activeElement?.tagName==='TEXTAREA')return;
 try{
  const j=await fetchJSON(API+'?mode=teacher',{headers:{Authorization:'Bearer '+teacherToken}});
  const before=JSON.stringify({rows:tData.records,stage:tData.stage}),after=JSON.stringify({rows:j.records,stage:j.stage});
  if(before!==after){tData=j;renderTeacher();}
 }catch{}
}
async function projectionLoad(){
 try{
  const j=await fetchJSON(API+'?mode=projection');
  const hash=JSON.stringify(j);
  if(hash!==snapshot){snapshot=hash;renderProjection(j);}
 }catch(e){if(!snapshot)fail(e,projectionLoad)}
}
function renderProjection(j){
 const q=j.question,s=j.stage,d=j.distribution;
 APP.innerHTML='<div class="projection-shell"><div class="intro"><div><div class="eyebrow">CP֍P · LINGUAGENS · PROJEÇÃO</div><h1>Revisão final · questão '+s.number+'/15</h1></div><div class="row"><span class="badge-big">'+(s.active?'EM APRESENTAÇÃO':'TRANSMISSÃO PAUSADA')+'</span><span class="chip">'+d.started+' participantes</span></div></div>'+
 '<div class="projection-main"><article class="card question-card">'+renderQuestion(q,s.number,s.reveal?s.answer:0,s.reveal,s.answer)+(s.reveal?'<div class="note"><h3>Gabarito · '+String.fromCharCode(64+j.answer)+'</h3><p>'+esc(j.why)+'</p></div>':'')+'</article>'+
 '<aside class="card stack"><div class="eyebrow">PAINEL DE SALA</div><h2>'+d.submitted+' entregas finalizadas</h2><p class="muted">'+d.started+' participantes iniciaram a atividade no Craft.</p><div class="line"></div>'+
 (s.reveal?'<h3>Respostas agregadas</h3><div class="distribution">'+q.options.map((o,i)=>'<div class="barrow"><span>'+String.fromCharCode(65+i)+'</span><div class="bar"><span style="width:'+Math.round(d.counts[i]/Math.max(1,d.counts.reduce((a,b)=>a+b,0))*100)+'%"></span></div><span>'+d.counts[i]+'</span></div>').join('')+'</div>':'<p class="muted">As escolhas da turma permanecem ocultas até a revelação do gabarito.</p>')+
 '<div class="note"><strong>'+d.comments+' comentários</strong><p class="micro">As respostas discursivas são exibidas individualmente apenas no painel do educador.</p></div></aside></div></div>';
}
if(MODE==='professor'){loadTeacher();}
else if(MODE==='projecao'){projectionLoad();setInterval(projectionLoad,5000);}
else{profileForm();setInterval(liveStudent,8000);}
if(MODE==='professor')setInterval(teacherPoll,8000);
})();