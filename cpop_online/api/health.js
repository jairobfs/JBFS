'use strict';
const {send,method}=require('./_http');const {config,ping}=require('./_craft');
module.exports=async(req,res)=>{if(!method(req,res,['GET']))return;try{config();await ping();send(res,200,{ready:true,storage:'craft'})}catch(e){send(res,200,{ready:false,storage:'craft',reason:e.code==='NOT_CONFIGURED'?'not-configured':'connection-unavailable'})}};
