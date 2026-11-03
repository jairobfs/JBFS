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
 assert.doesNotMatch(html,/<img\b|<script\b/i);
 assert.match(html,/&lt;img/);
 assert.match(html,/<strong>&lt;script&gt;alert\(1\)&lt;\/script&gt;<\/strong>/);
});
test('mantém ordem de listas numeradas para itens comentados',()=>{
 const html=render('1. evidência\n2. hipótese');
 assert.equal(html,'<ol><li>evidência</li><li>hipótese</li></ol>');
});

test('insere links HTTPS de PDF e imagens em notas vindas do Craft',()=>{
 const html=render('Leitura: [Artigo](https://example.org/artigo.pdf)\n\n![Diagrama](https://example.org/media.png)');
 assert.match(html,/href="https:\/\/example.org\/artigo.pdf"/);
 assert.match(html,/rel="noopener noreferrer"/);
 assert.match(html,/class="cpop-inline-image"/);
 assert.match(html,/alt="Diagrama"/);
});
test('bloqueia links ativos inseguros e atributos HTML enviados pelo Craft',()=>{
 const html=render('<script>alert(1)</script>\n\n[link](javascript:alert(1))\n\n![x" onerror="alert(1)](https://example.org/img.png)');
 assert.doesNotMatch(html,/<script>/);
 assert.doesNotMatch(html,/href="javascript:/);
 assert.doesNotMatch(html,/<img[^>]*\sonerror=/);
 assert.match(html,/&lt;script&gt;/);
});
