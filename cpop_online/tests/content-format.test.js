'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
require('../content-format.js');
const render=globalThis.CPOPContent.render;
test('preserva hierarquia de texto, títulos, listas e destaques da aula',()=>{
 const html=render('## Leitura e interpretação\n\n**Evidência:** texto e imagem.\n\n- elemento visual\n- dado escrito');
 assert.match(html,/<h4>Leitura e interpretação<\/h4>/);
 assert.match(html,/<strong>Evidência:<\/strong>/);
 assert.match(html,/<ul><li>elemento visual<\/li><li>dado escrito<\/li><\/ul>/);
});
test('mostra citação do estímulo sem transformar em marcação perigosa',()=>{
 const html=render('> Trecho do exame\n> continuação\n\nQuestão proposta.');
 assert.match(html,/<blockquote><p>Trecho do exame<br>continuação<\/p><\/blockquote>/);
 assert.match(html,/<p>Questão proposta\.<\/p>/);
});
test('escapa HTML e atributos enviados pela fonte antes de criar realce',()=>{
 const html=render('<img src=x onerror=alert(1)> **<script>alert(1)</script>**');
 assert.doesNotMatch(html,/<img|<script|onerror=/i);
 assert.match(html,/&lt;img/);
 assert.match(html,/<strong>&lt;script&gt;alert\(1\)&lt;\/script&gt;<\/strong>/);
});
test('mantém ordem de listas numeradas para itens comentados',()=>{
 const html=render('1. evidência\n2. hipótese');
 assert.equal(html,'<ol><li>evidência</li><li>hipótese</li></ol>');
});
