// services/instagramService.js
import fetch from 'node-fetch';

const IG_API = (path) => `https://graph.facebook.com/v21.0/${path}`;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Crea el container de IMAGEN (no cambia tu flujo).
 * Devuelve creation_id.
 */
export async function createContainer({ igUserId, accessToken, imageUrl, caption }) {
  const url = IG_API(`${igUserId}/media`) +
    `?image_url=${encodeURIComponent(imageUrl)}` +
    `&caption=${encodeURIComponent(caption)}` +
    `&access_token=${encodeURIComponent(accessToken)}`;

  const r = await fetch(url, { method: 'POST' });
  const text = await r.text();
  let j; try { j = JSON.parse(text); } catch { j = { raw: text }; }

  if (!r.ok || !j.id) {
    const msg = `IG createContainer error: ${r.status} ${r.statusText} - ${text}`;
    const e = new Error(msg);
    e.body = j;
    throw e;
  }
  return j.id; // creation_id
}

/**
 * (NUEVO) Consulta el estado de un container.
 * status_code: 'IN_PROGRESS' | 'FINISHED' | 'ERROR'
 */
export async function getContainerStatus({ creationId, accessToken }) {
  const url = IG_API(`${creationId}`) +
    `?fields=status_code` +
    `&access_token=${encodeURIComponent(accessToken)}`;

  const r = await fetch(url, { method: 'GET' });
  const text = await r.text();
  let j; try { j = JSON.parse(text); } catch { j = { raw: text }; }

  if (!r.ok) {
    const e = new Error(`IG getContainer error: ${r.status} ${r.statusText} - ${text}`);
    e.body = j;
    throw e;
  }
  // j.status_code: 'IN_PROGRESS' | 'FINISHED' | 'ERROR'
  return j;
}

/**
 * (NUEVO) Espera a que el container esté listo.
 * - Para foto: ~30s suelen bastar
 * - Para vídeo/reels: aumenta maxWaitMs
 */
export async function waitUntilContainerReady({
  creationId,
  accessToken,
  maxWaitMs = 30000,
  pollMs = 1500,
  log = console,
}) {
  const start = Date.now();
  let last;
  while (Date.now() - start < maxWaitMs) {
    const s = await getContainerStatus({ creationId, accessToken });
    last = s;
    log.info?.(`[IG WAIT] ${creationId} status_code=${s.status_code}`);

    if (s.status_code === 'FINISHED') return s;
    if (s.status_code === 'ERROR') {
      const e = new Error('IG container status ERROR');
      e.body = s;
      throw e;
    }
    await sleep(pollMs);
  }
  const e = new Error(`Timeout esperando container listo (${Math.round(maxWaitMs/1000)}s)`);
  e.body = last;
  throw e;
}

/**
 * Publica el container (tu versión original).
 * ⚠️ Puede dar 9007 si no esperas antes. Conservada por compatibilidad.
 */
export async function publishContainer({ igUserId, accessToken, creationId }) {
  const url = IG_API(`${igUserId}/media_publish`) +
    `?creation_id=${encodeURIComponent(creationId)}` +
    `&access_token=${encodeURIComponent(accessToken)}`;

  const r = await fetch(url, { method: 'POST' });
  const text = await r.text();
  let j; try { j = JSON.parse(text); } catch { j = { raw: text }; }

  if (!r.ok || !j.id) {
    const msg = `IG publish error: ${r.status} ${r.statusText} - ${text}`;
    const e = new Error(msg);
    e.body = j;
    throw e;
  }
  return j.id; // published media id
}

/**
 * (NUEVO, RECOMENDADO) Publica esperando a que el container esté listo y
 * reintenta automáticamente si IG responde 9007/2207027.
 *
 * isVideoLike: pon true para vídeos/reels (mayor timeout).
 */
export async function publishContainerWithWait({
  igUserId,
  accessToken,
  creationId,
  isVideoLike = false,
  log = console,
}) {
  // 1) Espera activa hasta FINISHED
  const maxWaitMs = isVideoLike ? 120000 : 30000;
  await waitUntilContainerReady({ creationId, accessToken, maxWaitMs, pollMs: 1500, log });

  // 2) Publicar con reintentos anti-9007
  const url = IG_API(`${igUserId}/media_publish`) +
    `?creation_id=${encodeURIComponent(creationId)}` +
    `&access_token=${encodeURIComponent(accessToken)}`;

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const r = await fetch(url, { method: 'POST' });
    const text = await r.text();
    let j; try { j = JSON.parse(text); } catch { j = { raw: text }; }

    if (r.ok && j?.id) {
      log.info?.(`[IG PUBLISH] OK creation_id=${creationId} -> ${j.id}`);
      return j.id;
    }

    const code = j?.error?.code;
    const sub  = j?.error?.error_subcode;
    const is9007 = code === 9007 || sub === 2207027;

    log.warn?.(`[IG PUBLISH] intento ${attempt}/${maxAttempts} → ${r.status} ${text}`);

    if (is9007 && attempt < maxAttempts) {
      // Backoff corto; IG a veces necesita unos ms extra
      await sleep(2000 * attempt);
      continue;
    }

    const e = new Error(`IG publish error: ${r.status} ${r.statusText} - ${text}`);
    e.body = j;
    throw e;
  }

  // En teoría no llegamos aquí
  throw new Error('IG publish: reintentos agotados');
}
