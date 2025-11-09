// jobs/adapters/runnerHttp.js
const BASE = process.env.WEEKLY_IG_BASE || 'http://localhost:5050/api/instagram';

async function postJson(url, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.ADMIN_KEY) headers['x-admin-key'] = process.env.ADMIN_KEY;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (res.status === 204) return { ok: true, empty: true }; // sin candidato disponible

  let data = {};
  try { data = await res.json(); } catch { /* ignore */ }

  if (!res.ok) {
    const msg = data?.error || `HTTP ${res.status}`;
    const hint = data?.hint ? ` — ${data.hint}` : '';
    throw new Error(`${msg}${hint}`);
  }
  return data;
}

/**
 * Llama a tus endpoints actuales de publicación.
 * @param {'post'|'carousel'|'reel'} type
 * @param {{ alias:string }} accountCtx
 * @param {{ theme?: string, id?: string, dryRun?: boolean }} opts
 */
export async function runViaHttp(type, accountCtx, opts = {}) {
  const { alias } = accountCtx;
  const { theme = null, id = null, dryRun = false } = opts;

  const urlMap = {
    post:     `${BASE}/publish-one`,
    carousel: `${BASE}/publish-carousel-one`,
    reel:     `${BASE}/publish-reel-one`,
  };

  const url = urlMap[type];
  if (!url) throw new Error(`Tipo no soportado: ${type}`);

  const payload = {
    account: alias, // 👈 tu router lo espera
    ...(theme ? { theme } : {}),
    ...(id ? { id } : {}),
    ...(dryRun ? { dryRun: true } : {}),
  };

  return postJson(url, payload);
}
