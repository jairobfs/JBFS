'use strict';
const TOTAL_CANON=301;
const code=n=>Number.isInteger(n)&&n>=1&&n<=TOTAL_CANON?'Q'+String(n).padStart(3,'0'):null;
function canonicalFromUid(uid){
 const s=String(uid||'');
 let m=s.match(/^canon-q([0-9]{3})$/i);
 if(m)return code(Number(m[1]));
 m=s.match(/^canon-vest-([0-9]{2})$/i);
 return m?code(265+Number(m[1])):null;
}
function canonicalFromSource(source){
 const found=[...String(source||'').matchAll(/\bQ([0-9]{3})\b/gi)].map(m=>code(Number(m[1]))).filter(Boolean);
 return [...new Set(found)];
}
function canonicalInfo(row){
 const expected=canonicalFromUid(row.uid),found=canonicalFromSource(row.source);
 const id=expected||found[0]||null;
 const issues=[];
 if(expected&&found.length===0)issues.push('missing-reference');
 if(found.length>1)issues.push('ambiguous-reference');
 if(expected&&found.length&&(!found.includes(expected)||found.length>1))issues.push('identity-mismatch');
 return {id,issues};
}
function canonicalAudit(rows){
 const all=rows.filter(r=>r.type==='questao');
 const linked=[];
 for(const row of all){const info=canonicalInfo(row);if(info.id||info.issues.length)linked.push({uid:row.uid,id:info.id,week:row.week,active:row.active,issues:[...info.issues]});}
 const seen=new Map();
 for(const row of linked){if(!row.id)continue;const a=seen.get(row.id)||[];a.push(row);seen.set(row.id,a);}
 for(const [,set] of seen)if(set.length>1)for(const item of set)item.issues.push('duplicate-reference');
 return {corpusSize:TOTAL_CANON,linked:linked.length,active:linked.filter(x=>x.active).length,byWeek:[24,25,26].map(week=>({week,count:linked.filter(x=>x.active&&x.week===week).length})),issues:linked.filter(x=>x.issues.length),items:linked};
}
module.exports={canonicalFromUid,canonicalFromSource,canonicalInfo,canonicalAudit};
