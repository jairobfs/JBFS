'use strict';
const {publicCatalog}=require('./_content');const {send,method}=require('./_http');
module.exports=async(req,res)=>{if(!method(req,res,['GET']))return;send(res,200,publicCatalog())};
