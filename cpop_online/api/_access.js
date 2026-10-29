'use strict';
const crypto=require('node:crypto'),{request,itemsOf}=require('./_craft');
const COLLECTION='5ce6423e-2313-51d9-0793-34692d233223';
function hash(value){const salt=crypto.randomBytes(16).toString('hex');return salt+':'+crypto.scryptSync(value,salt,32).toString('hex');}
function verify(value,encoded){try{const [salt,h]=encoded.split(':');if(!/^[a-f0-9]{32}$/.test(salt)||!/^[a-f0-9]{64}$/.test(h))return false;const a=crypto.scryptSync(String(value),salt,32),b=Buffer.from(h,'hex');return crypto.timingSafeEqual(a,b);}catch{return false;}}
async function config(){const all=itemsOf(await request('/collections/'+COLLECTION+'/items?maxDepth=0'));if(all.length!==1)throw Error('Configuração de acesso indisponível');return all[0];}
async function authorized(value,kind){try{const c=await config();return verify(value,c.properties?.[kind+'hash']||'');}catch{return false;}}
module.exports={hash,verify,config,authorized,COLLECTION};
