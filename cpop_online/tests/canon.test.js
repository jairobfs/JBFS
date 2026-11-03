'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {canonicalInfo,canonicalAudit}=require('../api/_canon');
test('VEST rows map to the original Q identity',()=>assert.deepEqual(canonicalInfo({uid:'canon-vest-30',source:'Q295 ↔ VEST/30'}),{id:'Q295',issues:[]}));
test('SAEB rows retain the source identifier',()=>assert.deepEqual(canonicalInfo({uid:'canon-q251',source:'CPOP · Q251 ↔ SAEB II/01'}),{id:'Q251',issues:[]}));
test('reject missing or mismatched provenance in the audit',()=>{
 assert.ok(canonicalInfo({uid:'canon-q251',source:'Q252'}).issues.includes('identity-mismatch'));
 assert.ok(canonicalInfo({uid:'canon-vest-01',source:'ENEM 2013'}).issues.includes('missing-reference'));
});
test('duplicate Q references are flagged even across different local UIDs',()=>{
 const x=canonicalAudit([
  {uid:'canon-q251',source:'Q251',type:'questao',active:true,week:25},
  {uid:'alternative-source',source:'Q251 ↔ SAEB II/01',type:'questao',active:false,week:25}
 ]);
 assert.equal(x.issues.length,2);
 assert.ok(x.issues.every(v=>v.issues.includes('duplicate-reference')));
});
test('authorial exercises remain outside the official Q inventory',()=>{
 const x=canonicalAudit([{uid:'s25-original',source:'CPOP · autoria docente',type:'questao',active:true,week:25}]);
 assert.equal(x.linked,0);
});