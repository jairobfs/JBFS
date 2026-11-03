/**
 * Cloudflare Workers adapter for the existing CPOP Vercel functions.
 * Routes and their Craft-backed behavior stay identical during the migration.
 * No secrets or server source code are published as static assets.
 */
import catalog from '../api/catalog.js';
import health from '../api/health.js';
import lessonAdmin from '../api/lesson-admin.js';
import lesson from '../api/lesson.js';
import live from '../api/live.js';
import me from '../api/me.js';
import people from '../api/people.js';
import results from '../api/results.js';
import reviewAdmin from '../api/review-admin.js';
import review from '../api/review.js';
import roster from '../api/roster.js';
import submit from '../api/submit.js';

const handlers = Object.freeze({
  '/api/catalog': catalog,
  '/api/health': health,
  '/api/lesson-admin': lessonAdmin,
  '/api/lesson': lesson,
  '/api/live': live,
  '/api/me': me,
  '/api/people': people,
  '/api/results': results,
  '/api/review-admin': reviewAdmin,
  '/api/review': review,
  '/api/roster': roster,
  '/api/submit': submit
});

const MAX_BODY_BYTES = 1024 * 1024;

function jsonError(status, message) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

async function readBody(request) {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return { value: undefined };
  }
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return { error: jsonError(413, 'Envio excede o limite de tamanho.') };
  }
  const contentType = request.headers.get('content-type') || '';
  if (!/^application\/json(?:\s*;|\s*$)/i.test(contentType)) {
    return { error: jsonError(415, 'Use application/json para enviar dados.') };
  }
  if (!request.body) return { value: null };

  const reader = request.body.getReader();
  const parts = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return { error: jsonError(413, 'Envio excede o limite de tamanho.') };
    }
    parts.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.byteLength;
  }
  const raw = new TextDecoder().decode(bytes);
  if (!raw.trim()) return { value: null };
  try {
    return { value: JSON.parse(raw) };
  } catch {
    return { error: jsonError(400, 'JSON inválido.') };
  }
}

async function invokeVercelHandler(handler, request, url) {
  const parsed = await readBody(request);
  if (parsed.error) return parsed.error;
  const req = {
    method: request.method,
    url: url.pathname + url.search,
    query: Object.fromEntries(url.searchParams),
    headers: Object.fromEntries(request.headers),
    body: parsed.value
  };

  const headers = new Headers({ 'X-Content-Type-Options': 'nosniff' });
  let ended = false;
  let payload = '';
  const res = {
    statusCode: 200,
    setHeader(name, value) {
      if (Array.isArray(value)) {
        headers.delete(name);
        for (const item of value) headers.append(name, String(item));
      } else {
        headers.set(name, String(value));
      }
      return this;
    },
    getHeader(name) {
      return headers.get(name);
    },
    end(value = '') {
      ended = true;
      payload = value;
      return this;
    }
  };

  try {
    await handler(req, res);
    if (!ended) {
      console.error('CPOP API function ended without response:', url.pathname);
      return jsonError(502, 'Resposta indisponível.');
    }
    return new Response(payload, { status: res.statusCode, headers });
  } catch (error) {
    console.error('CPOP Worker route failed:', url.pathname, error?.code || error?.name || 'unknown');
    return jsonError(503, 'Serviço temporariamente indisponível.');
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      const handler = handlers[url.pathname.replace(/\/$/, '')];
      if (!handler) return jsonError(404, 'Rota não encontrada.');
      return invokeVercelHandler(handler, request, url);
    }
    return env.ASSETS.fetch(request);
  }
};
