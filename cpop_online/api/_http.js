'use strict';
const crypto=require('node:crypto');
function send(res,status,data){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(data));}
function method(req,res,allowed){if(allowed.includes(req.method))return true;res.setHeader('Allow',allowed.join(', '));send(res,405,{error:'Método não permitido.'});return false;}
function str(x,max=128){return typeof x==='string' ? x.trim().slice(0,max) : '';}
function eq(a,b){const x=Buffer.from(String(a));const y=Buffer.from(String(b));return x.length===y.length && crypto.timingSafeEqual(x,y);}
function teacher(req){const key=process.env.CPOP_TEACHER_KEY;if(!key||key.length<16)return false;const bearer=str(req.headers.authorization,256).replace(/^Bearer\s+/i,'');return eq(key,bearer);}
function parseBody(req){if(req.body && typeof req.body==='object')return req.body;if(typeof req.body==='string'){try{return JSON.parse(req.body)}catch{return null}}return null;}
module.exports={send,method,str,eq,teacher,parseBody};
