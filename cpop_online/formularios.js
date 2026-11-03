(() => {
'use strict';
const app=document.querySelector('#formApp');
const teacher=new URLSearchParams(location.search).get('modo')==='professor';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
const put=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const types=[['radio','Múltipla escolha / questão'],['select','Categoria / menu'],['text','Resposta curta'],['textarea','Resposta discursiva'],['rating','Escala de 1 a 5'],['checkbox','Confirmação']];
let token=sessionStorage.getItem('cpop.teacher.token')||'';
let profile=get('cpop.profile'),forms=[],records=[],selected='',editing=null,busy=false,preview=false,status='';
let localDraft={},finals={};
const gid=()=>('c'+Math.random().toString(36).slice(2,10));
const newForm=()=>({uid:'form-'+Date.now().toString(36),week:26,order:900,title:'',description:'',active:false,fields:[{id:'campo1',kind:'radio',label:'',hint:'',required:true,options:['','','',''],correct:0,explanation:''},{id:'campo2',kind:'textarea',label:'',hint:'',required:false,options:[],correct:0,explanation:''}]});
const current=()=>forms.find(x=>x.uid===selected);
function notify(message,type){status=message;const node=document.querySelector('#formStatus');if(node){node.className='form-status '+(type||'');node.textContent=message;node.hidden=false;}}
async function api(method,body,mode,studentId){
 const params=new URLSearchParams();if(mode)params.set('mode',mode);if(studentId)params.set('studentId',studentId);
 const headers={'Content-Type':'application/json'};
 if(teacher)headers.Authorization='Bearer '+token;
 if(!teacher&&profile?.joinCode)headers['x-class-code']=profile.joinCode;
 const response=await fetch('/api/lesson?feature=forms'+(params.size?'&'+params:''),{method,headers,cache:'no-store',body:body?JSON.stringify(body):undefined});
 const result=await response.json();if(!response.ok)throw Object.assign(new Error(result.error||'Não foi possível consultar o Craft.'),{status:response.status});return result;
}
async function load(){
 try{
  const out=await api('GET',null,teacher?'teacher':'',teacher?null:profile?.studentId);
  forms=out.forms||[];records=teacher?out.records||[]:[];
  finals={};
  if(!teacher)(out.progress||[]).forEach(x=>{finals[x.formId]=x;});
  if(!forms.some(f=>f.uid===selected))selected=forms[0]?.uid||'';
  if(teacher&&editing?.id){const changed=forms.find(f=>f.id===editing.id);if(changed)editing=JSON.parse(JSON.stringify(changed));}
  render();
 }catch(e){if(teacher&&e.status===401){token='';sessionStorage.removeItem('cpop.teacher.token');login('PIN inválido ou sessão expirada.');}else app.innerHTML='<section class="form-card form-empty"><h2>Não foi possível carregar as atividades</h2><p>'+esc(e.message)+'</p><button class="form-btn primary" id="tryAgain">Tentar novamente</button></section>',document.querySelector('#tryAgain').onclick=load;}
}
function login(error){
 app.innerHTML='<section class="form-card" style="max-width:500px;margin:auto"><div class="form-kicker">CPOP · acesso docente</div><h1>Interatividades da turma</h1><p>Abra o editor e a análise das respostas com seu PIN do educador.</p><form id="auth"><label class="form-label" for="formPIN">PIN docente</label><input id="formPIN" class="form-btn" style="width:100%;justify-content:flex-start" type="password" autocomplete="off" required><div class="form-actions" style="margin-top:15px"><button class="form-btn primary">Abrir estúdio</button></div></form>'+(error?'<p class="form-status error">'+esc(error)+'</p>':'')+'</section>';
 document.querySelector('#auth').onsubmit=e=>{e.preventDefault();token=document.querySelector('#formPIN').value;sessionStorage.setItem('cpop.teacher.token',token);load();};
}
function profileScreen(){
 const name=profile?.name||'',joinCode=profile?.joinCode||'';
 app.innerHTML='<section class="form-card" style="max-width:620px;margin:0 auto"><div class="form-kicker">CPOP · Campo Mourão</div><h1>Suas interatividades</h1><p>Para responder, identifique-se com seu nome e o código da turma. A turma é única: <strong>CPOP - Campo Mourão</strong>.</p><form id="identify" class="form-editor"><label>Nome completo<input name="name" required minlength="4" maxlength="120" autocomplete="name" value="'+esc(name)+'"></label><label>Código de participação<input name="code" required minlength="4" type="password" value="'+esc(joinCode)+'" autocomplete="off"></label><button class="form-btn primary" type="submit">Continuar</button></form></section>';
 document.querySelector('#identify').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target),n=String(fd.get('name')).trim(),c=String(fd.get('code')).trim();if(n.length<4||c.length<4)return;profile={studentId:profile?.studentId&&/^[a-z0-9-]{12,90}$/i.test(profile.studentId)?profile.studentId:crypto.randomUUID(),name:n,group:'CPOP - Campo Mourão',joinCode:c};put('cpop.profile',profile);load();};
}
function listMarkup(){
 return '<aside class="form-panel"><h2>Atividades '+(teacher?'· edição':'· disponíveis')+'</h2><div class="form-cards">'+(forms.length?forms.map(x=>'<button class="form-select" data-open="'+esc(x.uid)+'" aria-current="'+String(selected===x.uid)+'"><small>Semana '+x.week+(teacher?(x.active?' · publicada':' · rascunho'):(finals[x.uid]?' · respondida':''))+'</small><strong>'+esc(x.title||'Sem título')+'</strong><small>'+x.fields.length+' campo(s)</small></button>').join(''):'<p class="form-muted">Nenhuma atividade publicada ainda.</p>')+'</div>'+(teacher?'<button class="form-btn primary" id="createForm" style="width:100%;margin-top:16px">Criar formulário</button>':'')+'</aside>';
}
function fieldMarkup(f,index,values,readonly){
 const raw=values?.[f.id],v=raw===undefined?'':raw;
 const required=f.required?' required':'';
 const hint=f.hint?'<p class="hint">'+esc(f.hint)+'</p>':'';
 let control='';
 if(f.kind==='radio')control='<div class="form-choices">'+f.options.map((x,i)=>'<label class="form-choice"><input type="radio" name="'+esc(f.id)+'" value="'+esc(x)+'"'+(v===x?' checked':'')+(i===0?required:'')+(readonly?' disabled':'')+'><span>'+esc(String.fromCharCode(65+i)+'. '+x)+'</span></label>').join('')+'</div>';
 if(f.kind==='select')control='<select name="'+esc(f.id)+'"'+required+(readonly?' disabled':'')+'><option value="">Selecione uma opção</option>'+f.options.map(x=>'<option value="'+esc(x)+'"'+(v===x?' selected':'')+'>'+esc(x)+'</option>').join('')+'</select>';
 if(f.kind==='text')control='<input type="text" name="'+esc(f.id)+'" maxlength="300" value="'+esc(v)+'" placeholder="Escreva sua resposta"'+required+(readonly?' disabled':'')+'>';
 if(f.kind==='textarea')control='<textarea name="'+esc(f.id)+'" rows="5" maxlength="2500" placeholder="Desenvolva sua resposta…"'+required+(readonly?' disabled':'')+'>'+esc(v)+'</textarea>';
 if(f.kind==='rating')control='<div class="form-rating" role="radiogroup" aria-label="'+esc(f.label)+'">'+[1,2,3,4,5].map((n,i)=>'<label><input type="radio" name="'+esc(f.id)+'" value="'+n+'"'+(Number(v)===n?' checked':'')+(i===0?required:'')+(readonly?' disabled':'')+'><span>'+n+'</span></label>').join('')+'</div><p class="hint">1 · Muito baixo &nbsp; 5 · Excelente</p>';
 if(f.kind==='checkbox')control='<label class="form-choice"><input type="checkbox" name="'+esc(f.id)+'"'+(v===true?' checked':'')+required+(readonly?' disabled':'')+'><span>Confirmar</span></label>';
 return '<fieldset class="form-entry" style="border:1px solid color-mix(in srgb,var(--form-jade) 40%,transparent)"><div class="form-field-number">Campo '+(index+1)+(f.required?' · obrigatório':' · opcional')+'</div><legend>'+esc(f.label)+'</legend>'+hint+control+'</fieldset>';
}
function draftKey(formId){return 'cpop.form.draft.'+profile.studentId+'.'+formId;}
function studentView(){
 if(!profile?.studentId||!profile?.name||!profile?.joinCode||profile?.group!=='CPOP - Campo Mourão'){profileScreen();return;}
 const f=current(),done=f?finals[f.uid]:null;
 if(f&&!done){localDraft=get(draftKey(f.uid))||{};}
 const filled=f?f.fields.filter(x=>localDraft[x.id]!==undefined&&localDraft[x.id]!==''&&localDraft[x.id]!==false).length:0;
 app.innerHTML='<div class="form-top"><div><div class="form-kicker">CP֍P · Caderno interativo</div><h1>Questões e interatividades</h1><p>Responda no seu ritmo. As respostas são registradas no Craft quando você enviar.</p></div><button class="form-btn ghost" id="changeStudent">'+esc(profile.name)+' · alterar identificação</button></div><div class="form-layout">'+listMarkup()+'<article class="form-card">'+(f?'<div class="form-kicker">Semana '+f.week+' · '+f.fields.length+' campo(s)</div><h2>'+esc(f.title)+'</h2><p>'+esc(f.description)+'</p>'+(done?'<div class="form-status success"><strong>Resposta entregue ao Craft.</strong><p>'+esc(done.updated)+'</p></div>'+f.fields.map((x,i)=>fieldMarkup(x,i,done.answers,true)).join('')+reviewMarkup(done.review):'<div class="form-progress" aria-label="Campos respondidos"><span style="width:'+Math.round(filled/f.fields.length*100)+'%"></span></div><p class="form-muted">'+filled+' de '+f.fields.length+' campos preenchidos neste dispositivo</p><form id="answerForm" class="form-fields">'+f.fields.map((x,i)=>fieldMarkup(x,i,localDraft,false)).join('')+'<div class="form-actions"><button class="form-btn primary" type="submit" id="sendForm">Enviar respostas</button><button type="button" class="form-btn ghost" id="clearDraft">Limpar rascunho</button></div></form>'):'<div class="form-empty"><h2>As próximas atividades aparecerão aqui.</h2><p>O professor ainda não publicou formulários.</p></div>')+'<div id="formStatus" hidden></div></article></div>';
 document.querySelector('#changeStudent').onclick=()=>{profile={...profile,joinCode:''};profileScreen();};
 document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{selected=b.dataset.open;studentView();});
 if(!f||done)return;
 const form=document.querySelector('#answerForm');
 form.addEventListener('input',()=>{localDraft=readAnswers(f,form);put(draftKey(f.uid),localDraft);const count=f.fields.filter(x=>localDraft[x.id]!==undefined&&localDraft[x.id]!==''&&localDraft[x.id]!==false).length;const span=document.querySelector('.form-progress span');if(span)span.style.width=Math.round(count/f.fields.length*100)+'%';const muted=document.querySelector('.form-progress+p');if(muted)muted.textContent=count+' de '+f.fields.length+' campos preenchidos neste dispositivo';});
 document.querySelector('#clearDraft').onclick=()=>{if(!confirm('Limpar suas respostas ainda não enviadas?'))return;localDraft={};put(draftKey(f.uid),{});studentView();};
 form.onsubmit=async e=>{e.preventDefault();if(busy)return;const answers=readAnswers(f,form);localDraft=answers;put(draftKey(f.uid),answers);busy=true;const btn=document.querySelector('#sendForm');btn.disabled=true;btn.textContent='Enviando ao Craft…';try{const result=await api('POST',{action:'submit',formId:f.id,version:f.version,studentId:profile.studentId,name:profile.name,group:profile.group,code:profile.joinCode,answers});if(!result.saved)throw Error('Gravação não confirmada.');finals[f.id]={formId:f.id,answers,updated:result.updated,review:result.review};localStorage.removeItem(draftKey(f.id));studentView();}catch(e){notify(e.message,'error');btn.disabled=false;btn.textContent='Tentar enviar novamente';}finally{busy=false;}};
}
function readAnswers(form,element){
 const fd=new FormData(element),out={};
 for(const f of form.fields){const value=fd.get(f.id);if(f.kind==='checkbox')out[f.id]=value!==null;else if(f.kind==='rating')out[f.id]=value?Number(value):'';else out[f.id]=value===null?'':String(value);}
 return out;
}
function reviewMarkup(review){
 if(!review||!review.possible)return '';
 return '<div class="form-status"><strong>Correção comentada: '+review.score+' de '+review.possible+'</strong>'+review.items.map(x=>'<p><strong>'+esc(x.id)+': '+(x.correct?'correta':'revisar')+'</strong> · Resposta: '+esc(x.answer)+(x.explanation?' · '+esc(x.explanation):'')+'</p>').join('')+'</div>';
}
function studentFormFromEditor(form){
 return '<div class="form-card" style="margin-top:20px"><div class="form-kicker">Prévia docente · sem envio</div><h2>'+esc(form.title||'Título da atividade')+'</h2><p>'+esc(form.description)+'</p>'+form.fields.map((f,i)=>fieldMarkup(f,i,{},true)).join('')+'</div>';
}
function teacherView(){
 const f=editing||current(),response=records.filter(r=>f&&r.formId===f.uid);
 app.innerHTML='<div class="form-top"><div><div class="form-kicker">CP֍P · Estúdio docente</div><h1>Formulários e questões</h1><p>Crie perguntas, enquetes, reflexões e escalas. A publicação e as respostas ficam no Craft.</p></div><div class="form-actions"><button class="form-btn ghost" id="refreshTeacher">Atualizar Craft</button></div></div><div class="form-layout">'+listMarkup()+'<section class="form-card">'+(f?editorMarkup(f,response):'<div class="form-empty"><h2>Crie sua primeira atividade.</h2><p>Use o modelo para perguntas objetivas, respostas abertas e escalas.</p><button class="form-btn primary" id="createFirst">Criar formulário</button></div>')+'<div id="formStatus" hidden></div></section></div>';
 document.querySelector('#refreshTeacher').onclick=()=>{editing=null;load();};
 document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{selected=b.dataset.open;editing=null;preview=false;teacherView();});
 document.querySelector('#createForm').onclick=createNew;
 document.querySelector('#createFirst')?.addEventListener('click',createNew);
 if(f)wireEditor(f);
}
function editorMarkup(f,response){
 return '<form id="formEditor" class="form-editor"><div class="form-editor-head"><div><div class="form-kicker">Conteúdo editável · Semana '+f.week+'</div><h2>'+esc(f.title||'Novo formulário')+'</h2></div><span class="form-kicker">'+(f.active?'Publicado':'Rascunho')+'</span></div><div class="form-editor-grid"><label>Identificador<input name="uid" maxlength="90" required pattern="[A-Za-z0-9_-]{4,90}" value="'+esc(f.uid)+'"></label><label>Semana<select name="week">'+[24,25,26].map(n=>'<option'+(f.week===n?' selected':'')+'>'+n+'</option>').join('')+'</select></label></div><div class="form-editor-grid"><label>Ordem<input name="order" type="number" min="0" max="9999" required value="'+Number(f.order)+'"></label><label>Publicação<span class="form-choice"><input type="checkbox" name="active"'+(f.active?' checked':'')+'> Visível aos alunos</span></label></div><label>Título<input name="title" required maxlength="220" value="'+esc(f.title)+'" placeholder="Ex.: Leitura e inferência · Semana 26"></label><label>Orientação inicial<textarea name="description" required minlength="5" rows="3">'+esc(f.description)+'</textarea></label><div class="form-editor-head"><h3>Campos do formulário</h3><button type="button" class="form-btn" id="addField">Adicionar campo</button></div><div id="editorFields">'+f.fields.map(editFieldMarkup).join('')+'</div><div class="form-actions"><button class="form-btn primary" type="submit" id="saveForm">Salvar no Craft</button><button class="form-btn" type="button" id="togglePreview">'+(preview?'Ocultar prévia':'Prévia do aluno')+'</button></div></form>'+(preview?studentFormFromEditor(f):'')+(f.id?'<div class="form-results"><div class="form-editor-head"><h3>Respostas recebidas</h3><span class="form-kicker">'+response.length+' entrega(s)</span></div>'+(response.length?response.map(r=>'<details class="form-response"><summary><strong>'+esc(r.name)+'</strong><span class="form-muted"> · '+esc(r.updated)+'</span></summary><dl>'+f.fields.map(q=>'<dt>'+esc(q.label)+'</dt><dd>'+esc(String(r.answers[q.id]??'Sem resposta'))+'</dd>').join('')+'</dl></details>').join(''):'<p class="form-muted">Ainda não há respostas. Os envios aparecerão aqui sem sair do painel.</p>')+'</div>':'');
}
function editFieldMarkup(f,i){
 const optionSet=types.map(([value,label])=>'<option value="'+value+'"'+(f.kind===value?' selected':'')+'>'+esc(label)+'</option>').join('');
 const hasOpts=['radio','select'].includes(f.kind);
 return '<article class="form-entry form-editor" data-field="'+esc(f.id)+'"><div class="form-editor-head"><h3>Campo '+(i+1)+'</h3><button type="button" class="form-btn ghost" data-remove="'+esc(f.id)+'" aria-label="Remover campo '+(i+1)+'">Remover</button></div><div class="form-editor-grid"><label>Tipo<select data-fprop="kind">'+optionSet+'</select></label><label>Identificador<input data-fprop="id" maxlength="90" required value="'+esc(f.id)+'"></label></div><label>Enunciado / pergunta<input data-fprop="label" required maxlength="240" value="'+esc(f.label)+'" placeholder="O que o estudante deverá responder?"></label><label>Ajuda ou contexto (opcional)<textarea rows="2" data-fprop="hint">'+esc(f.hint||'')+'</textarea></label>'+(hasOpts?'<label>Alternativas / categorias · uma por linha<textarea data-fprop="options" rows="5" placeholder="Opção A&#10;Opção B">'+esc((f.options||[]).join('\n'))+'</textarea></label>':'')+(f.kind==='radio'?'<div class="form-editor-grid"><label>Gabarito (0 = enquete sem gabarito)<input type="number" data-fprop="correct" min="0" max="6" value="'+(Number(f.correct)||0)+'"></label><label>Explicação do gabarito<input data-fprop="explanation" maxlength="900" value="'+esc(f.explanation||'')+'"></label></div>':'')+'<label class="form-choice"><input type="checkbox" data-fprop="required"'+(f.required?' checked':'')+'> Resposta obrigatória</label></article>';
}
function collectEditor(){
 const f=editing,el=document.querySelector('#formEditor');if(!f||!el)return;
 const read=n=>el.elements.namedItem(n);
 f.uid=read('uid').value.trim();f.week=Number(read('week').value);f.order=Number(read('order').value);f.title=read('title').value;f.description=read('description').value;f.active=read('active').checked;
 for(const [index,card] of [...el.querySelectorAll('[data-field]')].entries()){
  const field=f.fields[index];if(!field)continue;
  const p=k=>card.querySelector('[data-fprop="'+k+'"]');
  const newId=p('id').value.trim();field.kind=p('kind').value;field.label=p('label').value;field.hint=p('hint').value;field.required=p('required').checked;
  if(p('options'))field.options=p('options').value.split('\n').map(s=>s.trim()).filter(Boolean);
  if(p('correct'))field.correct=Number(p('correct').value)||0;
  if(p('explanation'))field.explanation=p('explanation').value;
  field.id=newId;
 }
}
function wireEditor(f){
 const el=document.querySelector('#formEditor');
 document.querySelector('#addField').onclick=()=>{collectEditor();f.fields.push({id:gid(),kind:'text',label:'',hint:'',required:true,options:[],correct:0,explanation:''});teacherView();};
 el.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{if(f.fields.length<=1){notify('Mantenha pelo menos um campo.','error');return;}const index=[...el.querySelectorAll('[data-field]')].indexOf(b.closest('[data-field]'));collectEditor();f.fields.splice(index,1);teacherView();});
 el.querySelectorAll('[data-fprop="kind"]').forEach(s=>s.onchange=()=>{collectEditor();teacherView();});
 el.oninput=()=>{collectEditor();};
 document.querySelector('#togglePreview').onclick=()=>{collectEditor();preview=!preview;teacherView();};
 el.onsubmit=async e=>{
  e.preventDefault();if(busy)return;collectEditor();
  const seen=new Set();for(const x of f.fields){if(!/^[a-z0-9_-]{4,90}$/i.test(x.id)||seen.has(x.id)||x.label.trim().length<4){notify('Cada campo precisa de ID único e pergunta completa.','error');return;}seen.add(x.id);if(['radio','select'].includes(x.kind)&&x.options.length<2){notify('Adicione pelo menos duas alternativas ou categorias.','error');return;}}
  busy=true;const b=document.querySelector('#saveForm');b.disabled=true;b.textContent='Salvando no Craft…';
  try{await api('POST',{action:'save',form:f,id:f.id||null,revision:f.revision||null});const uid=f.uid;editing=null;selected=uid;await load();notify('Formulário salvo na coleção pedagógica do Craft.','success');}catch(e){notify(e.message,'error');b.disabled=false;b.textContent='Tentar salvar';}finally{busy=false;}
 };
}
function createNew(){editing=newForm();preview=false;teacherView();}
function render(){if(teacher)teacherView();else studentView();setTimeout(reportHeight,50);}
function reportHeight(){try{parent.postMessage({type:'cpop:embed-height',height:document.documentElement.scrollHeight},location.origin);}catch{}}
new ResizeObserver(reportHeight).observe(document.body);
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.data?.type!=='cpop:theme-refresh')return;document.documentElement.dataset.theme=localStorage.getItem('cpop.theme')||'light';});
if(teacher&&!token)login('');else load();
})();