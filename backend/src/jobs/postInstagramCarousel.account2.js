// backend/src/jobs/postInstagramCarousel.account2.js

// ES Modules
import 'dotenv/config';
import axios from 'axios';
import mongoose from 'mongoose';
import ImagenGenerada from '../models/ImagenGenerada.js';

// ====== CONFIG DESDE TU .env (EXACTO) ======
const IG_USER_ID = process.env.IG_USER_ID_ACCOUNT2;            // <- tu var existente
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN_ACCOUNT2;  // <- tu var existente
const IG_ACCOUNT_ALIAS = process.env.IG_ACCOUNT_ALIAS || 'keikodevfree';

// (Opcional) si tu proyecto ya conecta a Mongo antes, quita estos connect/disconnect.
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB  = process.env.MONGO_DB;

// ====== TUNABLES ======
const CHILD_MAX_ATTEMPTS = 4;       // reintentos creación child (transient)
const POLL_INTERVAL_MS   = 2000;    // cada 2s
const CHILD_TIMEOUT_MS   = 120000;  // 120s por child
const PARENT_TIMEOUT_MS  = 120000;  // 120s contenedor carrusel

// ====== GRAPH ======
const GRAPH = 'https://graph.facebook.com/v21.0'; // ⬅️ actualizado v21.0

// ====== CAPTION BREVE ORIENTADO A keikodevfree ======
function buildCaptionKeikoDevFree({ titulo = '', tagsExtra = [] } = {}) {
  const base = [
    '#KeikoDevFree', '#RecursosGratis', '#IA', '#Diseño', '#DesarrolloWeb',
    '#Creatividad', '#Productividad', '#WebDev', '#OpenSource'
  ];
  const tituloSafe = titulo?.trim() ? `📌 ${titulo.trim()}\n\n` : '';
  const hashtags = [...new Set([...base, ...tagsExtra])]
    .filter(Boolean)
    .join(' ');
  return `${tituloSafe}Selección de recursos e inspiración visual para creadores. Síguenos en @${IG_ACCOUNT_ALIAS}.\n${hashtags}`;
}

// ====== UTILS ======
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Fuerza Cloudinary → JPEG estable (f_jpg + .jpg + w_1080)
function forceCloudinaryJpeg(url, { width = 1080, quality = 'auto:good' } = {}) {
  try {
    const u = new URL(url);
    if (!/res\.cloudinary\.com$/i.test(u.hostname)) return url;
    const trans = ['f_jpg', quality ? `q_${quality}` : null, width ? `w_${width}` : null]
      .filter(Boolean).join(',');
    u.pathname = u.pathname.replace(/\/image\/upload\/(?!.*\/f_jpg)/, `/image/upload/${trans}/`);
    u.pathname = u.pathname.replace(/\.(png|webp|avif)(?=$)/i, '.jpg');
    return u.toString();
  } catch {
    return url;
  }
}

// HEAD que exige image/jpeg (nada de image/* genérico)
async function headIsJpeg(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (!res.ok) return { ok: false, status: res.status, ct: null };
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    return { ok: /^image\/jpeg/.test(ct), status: res.status, ct };
  } catch (e) {
    return { ok: false, status: 0, ct: 'HEAD_FAIL' };
  }
}

// ====== IG HELPERS ======
async function igCreateCarouselItem({ imageUrl }) {
  const url = `${GRAPH}/${IG_USER_ID}/media`;
  const params = {
    image_url: imageUrl,
    is_carousel_item: true,
    access_token: IG_ACCESS_TOKEN
  };
  const { data } = await axios.post(url, null, { params });
  return data.id; // creation_id
}

/**
 * Intenta crear un child con 3 estrategias:
 *  A) original
 *  B) JPEG forzado (f_jpg + .jpg)
 *  C) JPEG 1080 (f_jpg + .jpg + w_1080)
 * Cada paso valida con HEAD que sea image/jpeg.
 */
async function igCreateCarouselItemSmart({ rawUrl, maxAttemptsPerStep = 2 }) {
  const attempts = [
    { label: 'original', makeUrl: () => rawUrl },
    { label: 'jpeg',     makeUrl: () => forceCloudinaryJpeg(rawUrl) },
    { label: 'jpeg1080', makeUrl: () => forceCloudinaryJpeg(rawUrl, { width: 1080, quality: 'auto:good' }) },
  ];

  let lastErr;
  for (const step of attempts) {
    const candidate = step.makeUrl();

    const pre = await headIsJpeg(candidate);
    console.log(`[carousel][preflight ${step.label}] url=${candidate} status=${pre.status} ct=${pre.ct}`);
    if (!pre.ok) {
      lastErr = new Error(`Preflight fallido (${step.label}): ${pre.status} ${pre.ct}`);
      continue;
    }

    for (let attempt = 1; attempt <= Math.min(CHILD_MAX_ATTEMPTS, maxAttemptsPerStep); attempt++) {
      try {
        const id = await igCreateCarouselItem({ imageUrl: candidate });
        console.log(`[carousel] child OK (${step.label}) creation_id=${id}`);
        return { creationId: id, usedUrl: candidate, mode: step.label };
      } catch (e) {
        const payload = e?.response?.data?.error || {};
        const transient = payload?.is_transient || payload?.code === 2;
        console.warn(
          `[carousel][attempt ${attempt}/${maxAttemptsPerStep}] fallo creando child (${step.label})`,
          payload || e.message
        );
        lastErr = e;
        if (!transient || attempt === maxAttemptsPerStep) break;
        // backoff exponencial con jitter (1s, 2s) por step
        const base = Math.pow(2, attempt - 1) * 1000;
        const jitter = Math.floor(Math.random() * 400);
        await sleep(base + jitter);
      }
    }
  }
  throw lastErr || new Error('No se pudo crear el child tras saneo y reintentos');
}

async function igCreateCarouselContainer({ childrenIds = [], caption }) {
  const url = `${GRAPH}/${IG_USER_ID}/media`;
  const params = {
    media_type: 'CAROUSEL',
    children: childrenIds.join(','),
    caption,
    access_token: IG_ACCESS_TOKEN
  };
  const { data } = await axios.post(url, null, { params });
  return data.id; // creation_id
}

async function igPublish({ creationId }) {
  const url = `${GRAPH}/${IG_USER_ID}/media_publish`;
  const params = { creation_id: creationId, access_token: IG_ACCESS_TOKEN };
  const { data } = await axios.post(url, null, { params });
  return data.id; // igMediaId
}

async function igGetStatusCode(creationId) {
  const url = `${GRAPH}/${creationId}`;
  const params = { fields: 'status_code', access_token: IG_ACCESS_TOKEN };
  const { data } = await axios.get(url, { params });
  return data?.status_code || null; // IN_PROGRESS | FINISHED | ERROR
}

/**
 * Espera hasta que el media container esté FINISHED (o timeout / error).
 */
async function waitUntilFinished(creationId, { timeoutMs, label }) {
  const start = Date.now();
  while (true) {
    let status = 'UNKNOWN';
    try {
      status = await igGetStatusCode(creationId);
      console.log(`[${label}] ${creationId} status_code=${status}`);
    } catch (e) {
      console.warn(`[${label}] fallo consultando status_code`, e?.response?.data || e.message);
    }

    if (status === 'FINISHED') return true;
    if (status === 'ERROR') throw new Error(`${label} status_code=ERROR (${creationId})`);

    if (Date.now() - start > timeoutMs) {
      throw new Error(`${label} timeout esperando FINISHED (${creationId})`);
    }

    await sleep(POLL_INTERVAL_MS);
  }
}

// ====== DATA PICKER (filtrando publicadas) ======
async function pickPublishableImages({ limit = 5 }) {
  const max = Math.min(Math.max(limit, 1), 10); // 1..10

  // Excluye imágenes ya publicadas en IG para esta cuenta
  const query = {
    publishable: true,
    finalUrl: { $exists: true, $ne: '' },
    $nor: [
      {
        publications: {
          $elemMatch: {
            platform: 'instagram',
            account: IG_ACCOUNT_ALIAS
          }
        }
      }
    ]
  };

  const imgs = await ImagenGenerada
    .find(query)
    .sort({ createdAt: -1 })
    .limit(max * 3) // buscamos más por si alguna cae
    .lean();

  return imgs; // devolvemos docs completos (necesitamos _id para actualizar)
}

// ====== JOB PRINCIPAL ======
/**
 * Publica un carrusel con imágenes publishable:true de ImagenGenerada.
 *
 * @param {Object} opts
 * @param {number} [opts.limit=5]  - nº de imágenes (1..10)
 * @param {string} [opts.titulo='']- título opcional para el caption
 * @param {Array<string>} [opts.tagsExtra=[]] - hashtags extra
 * @param {boolean} [opts.dryRun=false] - si true, no publica (solo simula)
 */
export async function postCarouselAccount2({
  limit = 5,
  titulo = '',
  tagsExtra = [],
  dryRun = false
} = {}) {
  if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
    throw new Error('Faltan IG_USER_ID_ACCOUNT2 o IG_ACCESS_TOKEN_ACCOUNT2 en .env');
  }

  const images = await pickPublishableImages({ limit });
  if (!images.length) {
    console.log('[keikodevfree.carousel] No hay imágenes publicables nuevas.');
    return null;
  }

  const caption = buildCaptionKeikoDevFree({ titulo, tagsExtra });

  if (dryRun) {
    const preview = images.slice(0, limit).map(i => i.finalUrl);
    console.log('[keikodevfree.carousel] DRY RUN →', { preview, caption });
    return { dryRun: true, imageUrls: preview, caption };
  }

  // 1) crear children robustos y esperar FINISHED por cada uno
  const childrenIds = [];
  const failedItems = [];
  const usedUrls = []; // [{imgId, usedUrl}]

  for (const img of images) {
    if (childrenIds.length >= limit) break;

    const rawUrl = img.finalUrl;
    if (!rawUrl) continue;

    try {
      const { creationId, usedUrl, mode } = await igCreateCarouselItemSmart({ rawUrl });
      try {
        await waitUntilFinished(creationId, { timeoutMs: CHILD_TIMEOUT_MS, label: 'child' });
        childrenIds.push(creationId);
        usedUrls.push({ imgId: img._id, usedUrl, mode });
      } catch (err) {
        failedItems.push({ url: rawUrl, error: err.message });
        console.error('[carousel] child no terminó a tiempo:', rawUrl, err.message);
      }
    } catch (e) {
      failedItems.push({ url: rawUrl, error: e?.response?.data?.error || e.message });
      console.error('[carousel] Item descartado tras reintentos:', rawUrl);
    }
  }

  // Requisitos de IG: un carrusel necesita ≥2 items
  if (childrenIds.length < 2) {
    console.error('[carousel] No hay suficientes items válidos (>=2) para publicar el carrusel.');
    return { error: 'NOT_ENOUGH_CHILDREN', failedItems, imageUrls: images.map(i => i.finalUrl) };
  }

  // 2) contenedor del carrusel y espera FINISHED
  const creationId = await igCreateCarouselContainer({ childrenIds, caption });
  await waitUntilFinished(creationId, { timeoutMs: PARENT_TIMEOUT_MS, label: 'parent' });

  // 3) publicar
  const igMediaId = await igPublish({ creationId });
  console.log('[keikodevfree.carousel] Publicado:', igMediaId);

  // 4) Marca como publicadas SOLO las imágenes que entraron en el carrusel
  try {
    const usedSet = new Set(usedUrls.map(u => String(u.imgId)));
    const usedIds = images
      .filter(i => usedSet.has(String(i._id)))
      .map(i => i._id);

    if (usedIds.length) {
      await ImagenGenerada.updateMany(
        { _id: { $in: usedIds } },
        {
          $push: {
            publications: {
              platform: 'instagram',
              account: IG_ACCOUNT_ALIAS,
              postId: igMediaId,
              postedAt: new Date()
            }
          }
        }
      );
    }
  } catch (e) {
    console.error('[keikodevfree.carousel] No se pudo actualizar publications:', e?.message || e);
  }

  return {
    ok: true,
    publishedId: igMediaId,     // ⬅️ para consistencia con post simple
    igMediaId,                  // alias para tu frontend actual
    postId: igMediaId,          // alias adicional
    childrenIds,
    failedItems,
    usedUrls,                   // [{imgId, usedUrl, mode}]
    imageUrls: images.map(i => i.finalUrl)
  };
}

// ====== CLI OPCIONAL ======
// Úsalo sólo si quieres lanzarlo manualmente: `node src/jobs/postInstagramCarousel.account2.js`
if (process.argv[1] === new URL(import.meta.url).pathname) {
  (async () => {
    let connected = false;
    try {
      if (MONGO_URI) {
        await mongoose.connect(MONGO_URI, { dbName: MONGO_DB });
        connected = true;
      }
      const res = await postCarouselAccount2({
        limit: 5,
        titulo: 'Selección del día',
        tagsExtra: ['#IAparaTodos', '#RecursosWeb'],
        dryRun: false
      });
      console.log(res);
    } catch (err) {
      console.error(err);
      process.exitCode = 1;
    } finally {
      if (connected) await mongoose.disconnect();
    }
  })();
}
