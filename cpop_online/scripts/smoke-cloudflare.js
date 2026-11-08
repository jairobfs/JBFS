'use strict';

const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { join, resolve } = require('node:path');

const root = resolve(__dirname, '..');
const host = 'http://127.0.0.1:8788';
const cli = join(root, 'node_modules', '.bin', 'wrangler');
const child = spawn(cli, ['dev', '--local', '--ip', '127.0.0.1', '--port', '8788'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, CI: 'true' }
});

let output = '';
let exited = false;
const remember = chunk => { output = (output + String(chunk)).slice(-12000); };
child.stdout.on('data', remember);
child.stderr.on('data', remember);
child.on('exit', () => { exited = true; });

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function fetchLocal(path, options = {}) {
  return fetch(host + path, { ...options, signal: AbortSignal.timeout(2000) });
}

async function main() {
  let ready = false;
  for (let i = 0; i < 90; i++) {
    if (exited) throw new Error('Wrangler exited before starting.');
    try {
      const res = await fetchLocal('/aula.html');
      if (res.status === 200) { ready = true; break; }
    } catch {}
    await sleep(500);
  }
  assert.equal(ready, true, 'Worker did not serve aula.html within 45 seconds.');

  const asset = await fetchLocal('/aula.html');
  assert.equal(asset.status, 200);
  assert.match(asset.headers.get('content-type') || '', /text\/html/);

  const health = await fetchLocal('/api/health');
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), {
    ready: false,
    storage: 'craft',
    reason: 'not-configured'
  });

  const unknown = await fetchLocal('/api/unknown');
  assert.equal(unknown.status, 404);
  assert.equal(unknown.headers.get('cache-control'), 'no-store');

  const invalidContentType = await fetchLocal('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: 'invalid'
  });
  assert.equal(invalidContentType.status, 415);

  console.log('CPOP Cloudflare local runtime smoke passed (assets + API, no Craft credentials).');
}

main().catch(error => {
  console.error(error.stack || error);
  console.error('Wrangler output (last 12k):\n' + output);
  process.exitCode = 1;
}).finally(() => {
  if (!exited) child.kill('SIGTERM');
});
