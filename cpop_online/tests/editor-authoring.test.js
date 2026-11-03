'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');

Object.assign(process.env,{
 CRAFT_API_BASE:'https://connect.craft.do/link/mock-authoring/api/v1',
 CRAFT_API_KEY:'automated-test-no-real-secret',
 CRAFT_COLLECTION_ID:'a129558e-4d81-0531-8b07-acf4c126cc7c',
 CRAFT_CONTENT_COLLECTION_ID:'c3e544ba-2939-2292-45ce-327664a06d9a'
});
const {hash}=require('../api/_access');
const handler=require('../api/lesson-admin');
const content=[],access={id:'settings-test',properties:{pinhash:hash('1844'),codehash:hash('jbfs')}};
const originalFetch=global.fetch;
global.fetch=async(url,options={})=>{
 const u=String(url),method=options.method||'GET',body=options.body?JSON.parse(options.body):{},pack=v=>({ok:true,status:200,text:async()=>JSON.stringify(v)});
 if(u.endsWith('/connection'))return pack({space:{name:'CPOP mock'}});
 if(u.includes('5ce6423e-2313-51d9-0793-34692d233223'))return pack({items:[access]});
 if(u.includes('c3e544ba-2939-2292-45ce-327664a06d9a')){
  if(method==='GET')return pack({items:content});
  if(method==='POST'){
   const item=body.items[0],row={id:'craft-item-'+(content.length+1),bloco:item.bloco,properties:{...item.properties}};
   content.push(row);return pack({items:[row]});
  }
  if(method==='PUT'){
   const patch=body.itemsToUpdate[0],row=content.find(v=>v.id===patch.id);
   if(!row)throw Error('Missing Craft test record');
   Object.assign(row.properties,patch.properties);return pack({items:[row]});
  }
 }
 throw Error('Unexpected Craft request '+method+' '+url);
};
test.after(()=>{global.fetch=originalFetch});
function call(method,body,token){
 return new Promise((resolve,reject)=>{
  const res={statusCode:200,setHeader(){},end(v){try{resolve({status:this.statusCode,body:JSON.parse(v)})}catch(e){reject(e)}}};
  Promise.resolve(handler({method,body,headers:token?{authorization:'Bearer '+token}:{}},res)).catch(reject);
 });
}
const base={
 uid:'cpop-questao-modelo-0001',week:24,order:725,type:'questao',
 title:'Inferência textual · item da AVA',body:'',image:'',alt:'',
 source:'CPOP · autoria docente',options:[],answer:1,why:'',active:false,
 module:'Interpretação e inferência',tags:'ENEM, linguagem, inferência',
 difficulty:'medio',palette:'pinheiro',duration:3,objective:'Relacionar informação explícita e inferência textual.'
};
test('AVA docente e Craft: rascunho incompleto, publicação, metadados, conflito e origem única',async()=>{
 let r=await call('GET');
 assert.equal(r.status,401,'A coleção não pode ser lida sem PIN docente.');
 r=await call('POST',{item:base},'1844');
 assert.equal(r.status,201);
 assert.equal(r.body.saved,true);
 assert.equal(content.length,1);
 assert.equal(content[0].properties.modulo,base.module);
 assert.equal(content[0].properties.etiquetas,base.tags);
 assert.equal(content[0].properties.objetivo,base.objective);
 assert.equal(content[0].properties.ativo,false);
 r=await call('GET',null,'1844');
 assert.equal(r.status,200);
 assert.equal(r.body.items.length,1);
 const draft=r.body.items[0];
 assert.equal(draft.active,false);
 assert.equal(draft.module,base.module);
 assert.equal(draft.difficulty,'medio');
 assert.equal(draft.palette,'pinheiro');
 assert.equal(draft.duration,3);
 assert.deepEqual(draft.options,[]);
 const finished={...draft,body:'Leia os dois textos e identifique a inferência mais adequada.',options:['Afirmativa A','Afirmativa B','Afirmativa C','Afirmativa D','Afirmativa E'],answer:3,why:'A opção C é sustentada pela relação entre os enunciados.',active:true};
 r=await call('PUT',{id:draft.id,revision:draft.revision,item:finished},'1844');
 assert.equal(r.status,200);
 assert.equal(content[0].properties.ativo,true);
 assert.equal(content[0].properties.gabarito,3);
 assert.equal(JSON.parse(content[0].properties.opcoes).length,5);
 const {publicLesson}=require('../api/_lesson');
 const all=await require('../api/_lesson').loadContent();
 const published=publicLesson(all).weeks.flatMap(w=>w.entries);
 assert.equal(published.length,1);
 assert.equal(published[0].module,base.module);
 assert.equal(published[0].palette,'pinheiro');
 // Edição externa pela coleção Craft: o editor deve ler o estado atualizado, não uma cópia.
 content[0].properties.titulo='Questão revisada diretamente no Craft';
 content[0].properties.objetivo='Revisão interdisciplinar';
 r=await call('GET',null,'1844');
 assert.equal(r.body.items[0].title,'Questão revisada diretamente no Craft');
 assert.equal(r.body.items[0].objective,'Revisão interdisciplinar');
 assert.notEqual(r.body.items[0].revision,draft.revision);
 // Revisão antiga não pode sobrescrever uma edição mais nova do Craft.
 r=await call('PUT',{id:draft.id,revision:draft.revision,item:finished},'1844');
 assert.equal(r.status,409);
 r=await call('POST',{item:base},'1844');
 assert.equal(r.status,409);
 // Uma explicação independente reutiliza a mesma coleção, com outra identidade.
 const material={...base,uid:'cpop-slide-modelo-0002',type:'slide',title:'Material de apoio',body:'Texto de apoio com exemplos.',options:[],active:true,palette:'ocre',module:'Estudo orientado'};
 r=await call('POST',{item:material},'1844');
 assert.equal(r.status,201);
 assert.equal(content.length,2);
 r=await call('GET',null,'1844');
 assert.equal(r.body.items.length,2);
 assert.ok(r.body.items.find(x=>x.uid==='cpop-slide-modelo-0002'&&x.palette==='ocre'));
});
