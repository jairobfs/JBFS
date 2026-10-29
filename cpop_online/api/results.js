'use strict';
const {send,method,teacher}=require('./_http');const {listAttempts}=require('./_craft');
module.exports=async(req,res)=>{if(!method(req,res,['GET']))return;if(!await teacher(req)){send(res,401,{error:'Acesso reservado ao educador.'});return}
 try{const all=(await listAttempts()).map(i=>({id:i.id||'',...(i.properties||{})}));const byStudent=new Map();for(const a of all){const id=a.alunoid||'sem-id';let st=byStudent.get(id);if(!st){st={id,nome:a.nomecompleto||a.apelido||'Estudante',apelido:a.apelido,turma:a.turma,attempts:0,best:{},last:a.quandoiso};byStudent.set(id,st)}st.attempts++;st.best[a.jogo]=Math.max(st.best[a.jogo]||0,Number(a.pontos||0));if(a.quandoiso>st.last)st.last=a.quandoiso}
  send(res,200,{attempts:all,students:[...byStudent.values()],totals:{students:byStudent.size,attempts:all.length}});
 }catch{send(res,503,{error:'Não foi possível consultar as respostas no Craft.'})}
};

