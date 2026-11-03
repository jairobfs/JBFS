'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {publicLesson,publicActivities}=require('../api/_lesson');
function row(uid,week,image,type='questao'){
 return {id:uid,revision:'revision',uid,week,order:1,type,title:'Questão demonstrativa',body:'Leia a figura para resolver o item.',image,alt:'Figura demonstrativa',source:'CPOP',options:['A','B','C','D'],answer:2,why:'Justificativa',active:true,points:100};
}
test('old Vercel host for canonical assets maps to deployment-local path',()=>{
 const src='https://cpop-linguagens-jairobfs7-1343s-projects.vercel.app/assets/canon/canon-q251.jpg';
 const x=publicLesson([row('canon-q251',25,src)]);
 assert.equal(x.weeks.find(w=>w.week===25).entries[0].image,'/assets/canon/canon-q251.jpg');
});
test('same asset path in student game catalog',()=>{
 const src='https://cpop-linguagens-jairobfs7-1343s-projects.vercel.app/assets/canon/canon-vest-03.jpg';
 const a=publicActivities([row('canon-vest-03',26,src)]);
 assert.equal(a.find(w=>w.week===26).questions[0].image,'/assets/canon/canon-vest-03.jpg');
});
test('GitHub originals reuse local version when already committed',()=>{
 const src='https://raw.githubusercontent.com/jairobfs/JBFS/main/cpop_online/assets/s24-vozes.svg';
 const a=publicLesson([row('s24-slide-1',24,src,'slide')]);
 assert.equal(a.weeks[0].entries[0].image,'/assets/s24-vozes.svg');
});
test('unrelated HTTPS images preserve their source URL',()=>{
 const src='https://example.com/static/photo.jpg';
 assert.equal(publicLesson([row('my-image-test',24,src)]).weeks[0].entries[0].image,src);
});
test('no external or protocol-relative URL is introduced',()=>{
 const a=publicLesson([row('malformed-123',24,'javascript:alert(1)')]);
 assert.equal(a.weeks[0].entries[0].image,'');
});