'use strict';
const crypto=require('node:crypto');
function send(res,status,data,publicCache){
 res.statusCode=status;
 res.setHeader('Content-Type','application/json; charset=utf-8');
 const ttl=Number(publicCache?.ttl),stale=Number(publicCache?.stale);
 const permitted=status===200&&Number.isInteger(ttl)&&ttl>=1&&ttl<=60&&Number.isInteger(stale)&&stale>=0&&stale<=300;
 res.setHeader('Cache-Control',permitted?'public, s-maxage='+ttl+', stale-while-revalidate='+stale:'no-store');
 res.end(JSON.stringify(data));
}
function method(req,res,allowed){if(allowed.includes(req.method))return true;res.setHeader('Allow',allowed.join(', '));send(res,405,{error:'Método não permitido.'});return false;}
function str(x,max=128){return typeof x==='string' ? x.trim().slice(0,max) : '';}
function eq(a,b){const x=Buffer.from(String(a));const y=Buffer.from(String(b));return x.length===y.length && crypto.timingSafeEqual(x,y);}
async function teacher(req){const bearer=str(req.headers.authorization,256).replace(/^Bearer\s+/i,'');return require('./_access').authorized(bearer,'pin');}
async function classAccess(code){return require('./_access').authorized(code,'code');}
function parseBody(req){if(req.body && typeof req.body==='object')return req.body;if(typeof req.body==='string'){try{return JSON.parse(req.body)}catch{return null}}return null;}
module.exports={send,method,str,eq,teacher,classAccess,parseBody};
