'use strict';
const {send,method}=require('./_http');
const {loadContent,publicActivities,fingerprint}=require('./_lesson');
module.exports=async(req,res)=>{if(!method(req,res,['GET']))return;try{const rows=await loadContent();if(!rows.length)throw Error('Coleção vazia');send(res,200,{version:'craft-'+fingerprint(rows),source:'Craft',activities:publicActivities(rows)})}catch(e){console.error('Catalog read',e.code||e.message);send(res,503,{error:'O catálogo da aula não pôde ser consultado no Craft.'})}};
