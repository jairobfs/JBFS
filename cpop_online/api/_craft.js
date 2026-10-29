'use strict';
const {URL}=require('node:url');
function config(){const base=process.env.CRAFT_API_BASE;const collection=process.env.CRAFT_COLLECTION_ID;if(!base||!collection)throw Object.assign(new Error('Integração Craft não configurada.'),{code:'NOT_CONFIGURED'});
 const url=new URL(base);if(url.protocol!=='https:'||url.hostname!=='connect.craft.do'||!/^\/link\/[^/]+\/api\/v1\/?$/.test(url.pathname))throw Object.assign(new Error('Endereço de conexão Craft inválido.'),{code:'BAD_CONFIG'});
 if(!/^[a-f0-9-]{36}$/i.test(collection))throw Object.assign(new Error('Identificador de coleção inválido.'),{code:'BAD_CONFIG'});
 return {base:url.toString().replace(/\/$/,''),collection};}
async function request(path,method='GET',body){const c=config();const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),14000);
 try{const response=await fetch(`${c.base}${path}`,{method,headers:{'Content-Type':'application/json','Accept':'application/json'},body:body?JSON.stringify(body):undefined,signal:ctrl.signal,cache:'no-store'});
  const raw=await response.text();let obj;try{obj=raw?JSON.parse(raw):{}}catch{obj={message:'Resposta não JSON do Craft.'}};
  if(!response.ok)throw Object.assign(new Error(`Craft HTTP ${response.status}`),{code:'CRAFT_HTTP',status:response.status});return obj;
 }finally{clearTimeout(timeout)}}
function itemsOf(data){if(Array.isArray(data))return data;if(Array.isArray(data?.items))return data.items;if(Array.isArray(data?.data?.items))return data.data.items;return []}
async function listAttempts(){const c=config();return itemsOf(await request(`/collections/${c.collection}/items?maxDepth=0`));}
async function saveAttempt(item){const c=config();return request(`/collections/${c.collection}/items`,'POST',{items:[item]});}
async function ping(){return request('/connection');}
module.exports={config,listAttempts,saveAttempt,ping};
