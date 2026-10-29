'use strict';
const crypto=require('node:crypto');
const {request,itemsOf}=require('./_craft');
const {activities:legacy}=require('./_content');
const COLLECTION=process.env.CRAFT_CONTENT_COLLECTION_ID;
const FIELDS=['uid','semana','ordem','tipo','titulo','corpo','imagem','alt','fonte','opcoes','gabarito','justificativa','ativo','pontos'];
function requireCollection(){if(!COLLECTION||!(/^[0-9a-f-]{36}$/i.test(COLLECTION)))throw new Error('Coleção pedagógica não configurada.');return COLLECTION;}
function revision(p){return crypto.createHash('sha256').update(JSON.stringify(FIELDS.map(k=>p[k]??null))).digest('hex').slice(0,16);}
function media(url){try{const u=new URL(url);return u.protocol==='https:'&&url.length<1200?u.href:''}catch{return '';}}
function parseOptions(x){try{const a=JSON.parse(x);return Array.isArray(a)&&a.length>=2&&a.length<=6&&a.every(v=>typeof v==='string'&&v.length<=600)?a:[]}catch{return []}}
function normalize(row){const p=row.properties||{};const x={id:row.id||'',revision:revision(p),uid:String(p.uid||'').slice(0,100),week:Number(p.semana),order:Number(p.ordem)||0,type:String(p.tipo||''),title:String(p.titulo||row.bloco||''),body:String(p.corpo||''),image:media(p.imagem||''),alt:String(p.alt||''),source:String(p.fonte||''),options:parseOptions(p.opcoes),answer:Number(p.gabarito)||0,why:String(p.justificativa||''),active:p.ativo!==false,points:Number(p.pontos)||0};
 if(![24,25,26].includes(x.week)||!x.uid||!['slide','questao','cartao'].includes(x.type))return null;
 if(x.type==='questao'&&(x.options.length<2||x.answer<1||x.answer>x.options.length))return null;
 return x;}
async function loadContent(){const raw=await request('/collections/'+requireCollection()+'/items?maxDepth=0');return itemsOf(raw).map(normalize).filter(Boolean).sort((a,b)=>a.week-b.week||a.order-b.order||a.uid.localeCompare(b.uid,'pt-BR'));}
function fingerprint(rows){return crypto.createHash('sha256').update(rows.map(r=>r.id+':'+r.revision).join('|')).digest('hex').slice(0,12);}
function buildActivities(rows){const all=legacy.map(a=>({...a,questions:[]}));for(const q of rows.filter(r=>r.active&&r.type==='questao')){const a=all.find(x=>x.week===q.week);if(!a)continue;const prev=legacy.flatMap(x=>x.questions).find(x=>x.id===q.uid);a.questions.push({id:q.uid,type:'choice',prompt:q.body,options:q.options,answer:q.answer,why:q.why,evidence:!!prev?.evidence||q.week===26,image:q.image,alt:q.alt,source:q.source});}return all;}
function publicActivities(rows){return buildActivities(rows).map(({id,week,type,eyebrow,title,theme,subtitle,color,duration,questions})=>({id,week,type,eyebrow,title,theme,subtitle,color,duration,questions:questions.map(({id,prompt,options,evidence,image,alt,source})=>({id,prompt,options,evidence,image,alt,source}))}));}
function publicLesson(rows){return {version:'craft-'+fingerprint(rows),source:'Craft',weeks:[24,25,26].map(week=>({week,title:legacy.find(a=>a.week===week)?.title||'',entries:rows.filter(r=>r.week===week&&r.active).map(({uid,week,order,type,title,body,image,alt,source,options,why,points})=>({uid,week,order,type,title,body,image,alt,source,options:type==='questao'?options:[],example:type==='cartao'?why:'',points}))}))};}
async function updateItem(id,props){return request('/collections/'+requireCollection()+'/items','PUT',{itemsToUpdate:[{id,properties:props}]});}
async function createItem(item){return request('/collections/'+requireCollection()+'/items','POST',{items:[item]});}
module.exports={FIELDS,loadContent,buildActivities,publicActivities,publicLesson,fingerprint,updateItem,createItem,revision,media,parseOptions,requireCollection};
