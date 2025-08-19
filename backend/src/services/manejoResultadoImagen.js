import axios from 'axios';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import ImagenGenerada from '../models/ImagenGenerada.js';
import { getComfyUrl } from './comfyService.js';
import { uploadImageBufferToImageKit } from './imagekit.js';

// ---------- Helpers ----------
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function withHttpCode(err, code) {
  err.http_code = code;
  return err;
}

async function retry(fn, { retries = 3, baseDelay = 600, factor = 1.8, label = '' } = {}) {
  let lastErr;
  for (let i = 1; i <= retries; i++) {
    try { return await fn(); }
    catch (e) {
      lastErr = e;
      const d = Math.round(baseDelay * Math.pow(factor, i - 1));
      console.warn(`[RETRY][${label}] intento ${i}/${retries} falló: ${e.message}. Esperando ${d}ms...`);
      await sleep(d);
    }
  }
  throw lastErr;
}

function pTimeout(promise, ms, label = 'op') {
  let t;
  const to = new Promise((_, rej) => t = setTimeout(() => rej(new Error(`Timeout@${label}`)), ms));
  return Promise.race([promise, to]).finally(() => clearTimeout(t));
}

// Mutex simple en memoria por promptId
const inFlight = new Set();
async function withMutex(key, fn) {
  if (inFlight.has(key)) {
    console.info(`[MUTEX] ya en curso para ${key}, omito ejecución duplicada`);
    return;
  }
  inFlight.add(key);
  try { return await fn(); }
  finally { inFlight.delete(key); }
}

// Cloudinary: subir buffer con reintentos
async function uploadBufferToCloudinary(buffer, { public_id, folder, overwrite = true, eagerOptions = {} } = {}) {
  return retry(() => new Promise((resolve, reject) => {
    const options = {
      public_id: folder ? `${folder}/${public_id}` : public_id,
      resource_type: 'image',
      overwrite,
      // No fuerzo color/quality aquí; lo puedes pasar vía eagerOptions si quieres
      ...eagerOptions
    };
    const uploader = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    // escribir el buffer
    uploader.end(buffer);
  }), { retries: 3, baseDelay: 700, factor: 1.7, label: 'cloudinary' });
}

// Descargar imagen de ComfyUI → Buffer (con &type=output + reintentos)
async function downloadFromComfy({ baseUrl, filename, auth, timeoutMs = 15000 }) {
  const url = new URL('/view', baseUrl);
  // normaliza filename para output/
  const fname = filename.startsWith('output/') ? filename : `output/${filename}`;
  url.searchParams.set('filename', fname);
  url.searchParams.set('type', 'output');

  console.log(`📡 Descargando imagen desde ${url.toString()}`);

  const res = await pTimeout(
    axios.get(url.toString(), {
      responseType: 'arraybuffer',
      auth,
      timeout: timeoutMs
    }),
    timeoutMs + 2000,
    'download'
  );

  if (res.status !== 200 || !res.data) {
    throw new Error(`Descarga inválida (${res.status})`);
  }
  const buf = Buffer.from(res.data);
  if (!buf.byteLength) throw new Error('Descarga vacía (0 bytes)');
  return { buffer: buf, comfyViewUrl: url.toString() };
}

// ---------- FUNCIÓN PRINCIPAL REFAC ----------

/**
 * Finaliza el job: descarga de Comfy, comprime si >10MB, sube (Cloudinary/ImageKit) e idempotencia en Mongo.
 * - Evita reentradas con mutex por promptId
 * - Si no completa a tiempo, lanza http_code=420 para que el caller responda 202/PROCESSING
 */
export const manejarFinalizacionDeJob = async (promptId, { nickname, prompt, userId, filename }) => {
  return withMutex(promptId, async () => {
    try {
      // Idempotencia temprana: si ya está completada, salimos
      const ya = await ImagenGenerada.findOne({ prompt_id: promptId }).select('status finalUrl filename');
      if (ya?.status === 'completada' && ya?.finalUrl) {
        console.info(`[IDEMP] ${promptId} ya completada con ${ya.filename}`);
        return;
      }

      const fecha = new Date().toISOString().split('T')[0];
      const carpetaCloudinary = `keikoprompts/${nickname}/${fecha}`;
      const comfyUrl = await getComfyUrl('flux');

      const auth = {
        username: process.env.COMFY_AUTH_USER,
        password: process.env.COMFY_AUTH_PASS,
      };

      // 1) Descargar con reintentos
      const { buffer: originalBuffer, comfyViewUrl } = await retry(
        () => downloadFromComfy({ baseUrl: comfyUrl, filename, auth, timeoutMs: 18000 }),
        { retries: 5, baseDelay: 700, factor: 1.6, label: 'download' }
      );

      let workBuffer = originalBuffer;
      let finalFilename = filename;

      // 2) Si >10MB, convertir a JPG (Q90). Si sigue >10MB, fallback ImageKit
      const TEN_MB = 10 * 1024 * 1024;
      const originalSize = workBuffer.byteLength;

      let subirA = 'cloudinary';
      if (originalSize > TEN_MB) {
        console.log(`📦 Imagen >10MB (${(originalSize/1024/1024).toFixed(2)} MB): convirtiendo a JPG (calidad 90)...`);
        const jpgBuffer = await sharp(workBuffer).jpeg({ quality: 90 }).toBuffer();
        workBuffer = jpgBuffer;
        finalFilename = filename.replace(/\.[^/.]+$/, '.jpg');

        if (workBuffer.byteLength > TEN_MB) {
          console.log(`🚀 JPG sigue >10MB (${(workBuffer.byteLength/1024/1024).toFixed(2)} MB) → usaremos ImageKit`);
          subirA = 'imagekit';
        }
      }

      // 3) Subir (Cloudinary o ImageKit)
      let finalUrl;
      if (subirA === 'cloudinary') {
        console.log('☁️ Subiendo a Cloudinary...');
        const nombreSinExt = finalFilename.replace(/\.[^/.]+$/, '');
        const up = await uploadBufferToCloudinary(workBuffer, {
          public_id: nombreSinExt,
          folder: carpetaCloudinary,
          overwrite: true,
          // puedes pasar aquí eagerOptions si quieres width/crop/quality por servidor
          eagerOptions: {}
        });
        finalUrl = up.secure_url;
      } else {
        console.log('🌤️ Subiendo a ImageKit (fallback >10MB)...');
        const up = await uploadImageBufferToImageKit(workBuffer, finalFilename);
        finalUrl = up.url;
      }

      // 4) Guardar en Mongo (idempotente)
      const upd = await ImagenGenerada.updateOne(
        { prompt_id: promptId, status: { $ne: 'completada' } },
        {
          $set: {
            filename: finalFilename,
            url: comfyViewUrl,   // guardamos la view con &type=output
            finalUrl,
            status: 'completada',
            updatedAt: new Date()
          }
        }
      );

      if (upd.matchedCount === 0) {
        // Puede que otra instancia lo haya completado, o el doc no existe
        console.warn(`[DB] No se encontró/actualizó doc para prompt_id=${promptId} (quizá ya completado)`);
      } else if (upd.modifiedCount === 0) {
        console.info(`[DB] Doc ya estaba en estado final para prompt_id=${promptId}`);
      } else {
        console.log(`✅ Imagen subida y MongoDB actualizada (${promptId})`);
      }
    } catch (err) {
      // Si es un timeout de alguna etapa “larga”, devolvemos 420 para que el caller responda 202/PROCESSING
      if (/Timeout@/.test(err.message)) {
        console.error(`⚠️ manejarFinalizacionDeJob timeout (${promptId}): ${err.message}`);
        throw withHttpCode(new Error('Timeout waiting for parallel processing.'), 420);
      }
      console.error(`❌ Error en manejarFinalizacionDeJob (${promptId}):`, err);
      throw err; // deja que el caller decida el status HTTP final
    }
  });
};
