'use strict';
const {send,method}=require('./_http');
const {loadPublicContent,publicLesson}=require('./_lesson');
module.exports=async(req,res)=>{if(new URL(req.url||'/', 'https://cpop.local').searchParams.get('mini')==='1'||String(req.query?.mini||'')==='1')return require('../mini_backend')(req,res);if(!method(req,res,['GET']))return;try{const rows=await loadPublicContent();if(!rows.length)throw Error('Coleção vazia');send(res,200,publicLesson(rows),{ttl:20,stale:120})}catch(e){console.error('Lesson read',e.code||e.message);send(res,503,{error:'Não foi possível consultar a aula no Craft.'})}};
