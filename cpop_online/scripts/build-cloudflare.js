'use strict';

/**
 * Generates a public-only static asset directory.
 * Never publish api/, *backend.js, environment files, tests or source configs.
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, '.cloudflare-public');
const publicFiles = [
  'index.html', 'aula.html', 'estudar.html', 'professor.html',
  'editor.html', 'apresentar.html', 'jogos.html', 'formularios.html',
  'minisimulado.html',
  'app.js', 'classroom.js', 'content-format.js', 'editor.js',
  'formularios.js', 'minisimulado.js', 'portal-embed.js', 'portal.js',
  'presenter.js', 'professor.js', 'study.js',
  'editor-ui.css', 'formularios.css', 'glass-web.css', 'minisimulado.css',
  'refinement.css', 'styles.css', 'teacher.css'
];

const generatedDir = path.resolve(root, '.cloudflare-public');
if (out !== generatedDir || path.dirname(out) !== root) {
  throw new Error('Invalid generated asset directory.');
}
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const name of publicFiles) {
  const source = path.join(root, name);
  if (!fs.statSync(source).isFile()) {
    throw new Error('Expected public asset is not a file: ' + name);
  }
  fs.copyFileSync(source, path.join(out, name));
}

const assets = path.join(root, 'assets');
if (fs.existsSync(assets)) {
  fs.cpSync(assets, path.join(out, 'assets'), { recursive: true });
}

const entries = fs.readdirSync(out);
if (entries.includes('api') || entries.some(x => x.startsWith('.env') || /backend\.js$/.test(x))) {
  throw new Error('Private backend file leaked into static assets.');
}
console.log('CPOP public assets prepared:', publicFiles.length, 'root files plus assets/.');
