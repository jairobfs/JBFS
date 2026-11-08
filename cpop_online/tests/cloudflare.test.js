'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { readdirSync, existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');

async function worker() {
  return (await import('../cloudflare/worker.mjs')).default;
}

test('Cloudflare keeps public assets behind the assets binding', async () => {
  const app = await worker();
  let observed;
  const request = new Request('https://cpop-preview.workers.dev/aula.html');
  const result = await app.fetch(request, {
    ASSETS: { fetch: async r => {
      observed = new URL(r.url).pathname;
      return new Response('aula', { status: 200 });
    } }
  });
  assert.equal(observed, '/aula.html');
  assert.equal(await result.text(), 'aula');
});

test('unknown API paths do not fall through to static assets', async () => {
  const app = await worker();
  const result = await app.fetch(new Request('https://cpop-preview.workers.dev/api/unknown'), {
    ASSETS: { fetch: () => { throw Error('Asset fallback is forbidden for API requests'); } }
  });
  assert.equal(result.status, 404);
  assert.equal(result.headers.get('cache-control'), 'no-store');
});

test('existing CPOP API handler keeps method enforcement', async () => {
  const app = await worker();
  const response = await app.fetch(new Request('https://cpop-preview.workers.dev/api/catalog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}'
  }), {});
  assert.equal(response.status, 405);
  assert.match(response.headers.get('allow'), /GET/);
});

test('invalid request JSON is rejected before calling Craft', async () => {
  const app = await worker();
  const response = await app.fetch(new Request('https://cpop-preview.workers.dev/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{bad'
  }), {});
  assert.equal(response.status, 400);
});

test('non-JSON writes are rejected before calling Craft', async () => {
  const app = await worker();
  const response = await app.fetch(new Request('https://cpop-preview.workers.dev/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: 'test'
  }), {});
  assert.equal(response.status, 415);
});

test('generated public bundle does not expose server-side routes or secrets', () => {
  const output = join(root, '.cloudflare-public');
  assert.equal(existsSync(output), true, 'run npm run build:cloudflare first');
  const names = readdirSync(output);
  assert.equal(names.includes('api'), false);
  assert.equal(names.includes('mini_backend.js'), false);
  assert.equal(names.includes('forms_backend.js'), false);
  assert.equal(names.includes('.env.example'), false);
  assert.equal(names.includes('aula.html'), true);
  assert.equal(names.includes('minisimulado.html'), true);
});

test('Cloudflare targets the existing jbfs Worker and only deploys the isolated public bundle', () => {
  const config = JSON.parse(readFileSync(join(root, 'wrangler.jsonc'), 'utf8'));
  assert.equal(config.name, 'jbfs');
  assert.equal(config.main, './cloudflare/worker.mjs');
  assert.equal(config.assets.directory, './.cloudflare-public');
  assert.deepEqual(config.assets.run_worker_first, ['/api/*']);
});
