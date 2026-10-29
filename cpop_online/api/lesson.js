'use strict';
const {send,method}=require('./_http');
const {loadContent,publicLesson}=require('./_lesson');
module.exports=async(req,res)=>{if(!method(req,res,['GET']))return;try{const rows=await loadContent();if(!rows.length)throw Error('Coleção vazia');send(res,200,publicLesson(rows))}catch(e){console.error('Lesson read',e.code||e.message);send(res,503,{error:'Não foi possível consultar a aula no Craft.'})}};
