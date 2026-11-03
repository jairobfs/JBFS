'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

test('identificador discente continua estável apenas para a mesma pessoa', () => {
  for (const filename of ['classroom.js', 'app.js']) {
    const script = source(filename);
    const match = script.match(/const studentName=f\.elements\.name\.value\.trim\(\).*?studentId:samePerson&&profile\?\.studentId\?profile\.studentId:crypto\.randomUUID\(\)\};/s);
    assert.ok(match, filename + ' precisa validar a identidade antes de reutilizar o ID');
    const update = new Function('f', 'profile', 'crypto', match[0] + 'return profile;');
    const form = name => ({elements: {
      name: {value: name}, alias: {value: 'apelido'}, joinCode: {value: 'codigo-teste'}
    }});
    const existing = {name: 'Aluno Exemplo', studentId: 'id-original-12345'};
    const uuid = {randomUUID: () => 'id-novo-67890'};
    assert.equal(update(form('  ALUNO   EXEMPLO  '), existing, uuid).studentId, existing.studentId, filename);
    assert.equal(update(form('Outra Pessoa'), existing, uuid).studentId, 'id-novo-67890', filename);
  }
});

test('mini-simulado reconhece o cadastro canônico sem aceitar código ou ID inválidos', () => {
  const script = source('minisimulado.js');
  const match = script.match(/function sharedProfile\(\)\{[\s\S]*?\n\}/);
  assert.ok(match, 'A validação do cadastro compartilhado deve existir');
  const factory = new Function('stored', match[0] + 'return sharedProfile;');
  const good = {name: 'Aluno Exemplo', group: 'CPOP - Campo Mourão',
    joinCode: 'codigo-teste', studentId: 'id-valido-12345'};
  assert.deepEqual(factory(() => good)(), good);
  assert.equal(factory(() => ({...good, joinCode: ''}))(), null);
  assert.equal(factory(() => ({...good, studentId: 'x'}))(), null);
  assert.equal(factory(() => ({...good, group: 'Outra turma'}))(), null);
  assert.match(script, /if\(!beginWithSharedProfile\(\)\)profileForm\(\)/);
  assert.match(script, /write\('cpop\.profile',\{name,alias:/);
});

test('trocar de pessoa recarrega os módulos já abertos sem misturar respostas', () => {
  const script = source('portal.js');
  assert.match(script, /frameProfiles\.get\(frame\) !== fingerprint/);
  assert.match(script, /if \(frame\) ensureStudentFrame\(frame\)/);
});
