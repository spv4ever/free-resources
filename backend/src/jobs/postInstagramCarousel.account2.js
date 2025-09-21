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

async function headOk(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (!res.ok) return false;
    const ct = res.headers.get('content-type') || '';
    return ct.startsWith('image/');
  } catch {
    return false;
  }
}

// ====== IG HELPERS ======
async function igCreateCarouselItem({ imageUrl }) {
  const url = `https://graph.facebook.com/v20.0/${IG_USER_ID}/media`;
  const params = {
    image_url: imageUrl,
    is_carousel_item: true,
    access_token: IG_ACCESS_TOKEN
  };
  const { data } = await axios.post(url, null, { params });
  return data.id; // creation_id
}

/**
 * Intenta crear un child con reintentos (maneja errores transitorios de Meta).
 */
async function igCreateCarouselItemRetry({ imageUrl, maxAttempts = CHILD_MAX_ATTEMPTS }) {
  // Verificación rápida del asset antes de pegar a Graph
  const ok = await headOk(imageUrl);
  if (!ok) {
    throw new Error(`HEAD check falló o no es image/* → ${imageUrl}`);
  }

  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const id = await igCreateCarouselItem({ imageUrl });
      return id;
    } catch (e) {
      lastErr = e;
      const payload = e?.response?.data?.error || {};
      const transient = payload?.is_transient || payload?.code === 2;

      console.error(
        `[carousel][attempt ${attempt}/${maxAttempts}] fallo creando child para ${imageUrl}`,
        payload || e.message
      );

      if (!transient || attempt === maxAttempts) break;

      // backoff exponencial con jitter (1s, 2s, 4s, 8s +/- aleatorio)
      const base = Math.pow(2, attempt - 1) * 1000;
      const jitter = Math.floor(Math.random() * 400);
      await sleep(base + jitter);
    }
  }
  throw lastErr;
}

async function igCreateCarouselContainer({ childrenIds = [], caption }) {
  const url = `https://graph.facebook.com/v20.0/${IG_USER_ID}/media`;
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
  const url = `https://graph.facebook.com/v20.0/${IG_USER_ID}/media_publish`;
  const params = { creation_id: creationId, access_token: IG_ACCESS_TOKEN };
  const { data } = await axios.post(url, null, { params });
  return data.id; // igMediaId
}

async function igGetStatusCode(creationId) {
  const url = `https://graph.facebook.com/v20.0/${creationId}`;
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
    .limit(max)
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
  const imageUrls = images.map(i => i.finalUrl);

  const caption = buildCaptionKeikoDevFree({ titulo, tagsExtra });

  if (dryRun) {
    console.log('[keikodevfree.carousel] DRY RUN →', { imageUrls, caption });
    return { dryRun: true, imageUrls, caption };
  }

  // 1) crear children (con reintentos) y esperar FINISHED por cada uno
  const childrenIds = [];
  const failedItems = [];

  for (const img of images) {
    try {
      const childId = await igCreateCarouselItemRetry({ imageUrl: img.finalUrl });
      try {
        await waitUntilFinished(childId, { timeoutMs: CHILD_TIMEOUT_MS, label: 'child' });
        childrenIds.push(childId);
      } catch (err) {
        failedItems.push({ url: img.finalUrl, error: err.message });
        console.error('[carousel] child no terminó a tiempo:', img.finalUrl, err.message);
      }
    } catch (e) {
      failedItems.push({ url: img.finalUrl, error: e?.response?.data?.error || e.message });
      console.error('[carousel] Item descartado tras reintentos:', img.finalUrl);
    }
  }

  // Requisitos de IG: un carrusel necesita ≥2 items
  if (childrenIds.length < 2) {
    console.error('[carousel] No hay suficientes items válidos (>=2) para publicar el carrusel.');
    return { error: 'NOT_ENOUGH_CHILDREN', failedItems, imageUrls };
  }

  // 2) contenedor del carrusel y espera FINISHED
  const creationId = await igCreateCarouselContainer({ childrenIds, caption });
  await waitUntilFinished(creationId, { timeoutMs: PARENT_TIMEOUT_MS, label: 'parent' });

  // 3) publicar
  const igMediaId = await igPublish({ creationId });

  console.log('[keikodevfree.carousel] Publicado:', igMediaId);

  // 4) Marca como publicadas SOLO las imágenes que entraron en el carrusel
  try {
    const failedSet = new Set(failedItems.map(f => f.url));
    const usedIds = images
      .filter(i => !failedSet.has(i.finalUrl))
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

  return { igMediaId, childrenIds, failedItems, imageUrls };
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
