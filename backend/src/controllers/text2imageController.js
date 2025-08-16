// src/controllers/text2imageController.js
import axios from 'axios';
import crypto from 'crypto';
import Text2ImageJob from '../models/Text2ImageJob.js';
import { flujosCargados } from '../config/flujosCargados.js';
import { getComfyUrl } from '../services/comfyService.js';
import { getComfyAuth } from '../utils/comfyAuth.js';
import { rollbackDebit } from '../utils/tokenRollback.js';
import { patchFluxNormal } from '../utils/patchFluxNormal.js';
// import { resolveComfyLoraName } from '../utils/resolveComfyLora.js';
import { consumirToken, reembolsarToken } from '../services/tokenService.js'; // ⬅️ nuevo
import { trackPendingJob, getJobStatus  } from '../services/comfySocketWatcher.js'; // ajusta la ruta a tu watcher real

const proporciones = {
  '1:1': [1024, 1024],
  '2:3': [768, 1152],
  '3:4': [768, 1024],
  '3:2': [1152, 768],
  '4:3': [1024, 768],
  '16:9': [1280, 720],
  '9:16': [720, 1280],
};



const clonar = (obj) => JSON.parse(JSON.stringify(obj));

export const iniciarTextoImagen = async (req, res) => {
  const userId = req.user._id;
  const tokenCost = req.__tokenCost || 1;
  const tokenTxId = req.__tokenTxId;
  const isPrivileged = ['pro', 'admin'].includes(req.user?.role);
  const DEFAULT_STEPS_BACK = 10;

  try {
    const {
        prompt,
        ratio = '1:1',
        steps = 20,
        seed,
        filename_prefix = 'keiko',
        modo = 'normal',
        // 🔽 nuevos campos del frontend para LoRA:
        loraName,             // ej: "aidmaHyperrealism-FLUX-v0.3.safetensors"
        loraTrigger,          // ej: "aidmaHyperrealism"
        loraStrengthModel,    // ej: 1.0
        loraStrengthClip,     // opcional (por defecto 1.0 en tu flujo)
        loraInsertMode        // 'prefix' | 'suffix' (default: 'prefix')
        } = req.body || {};
    const stepsNum = Number(steps);
    const stepsSafe = isPrivileged
    ? (Number.isFinite(stepsNum) ? Math.max(1, Math.min(60, Math.trunc(stepsNum))) : DEFAULT_STEPS_BACK)
    : DEFAULT_STEPS_BACK;

    if (!prompt?.trim()) {
      return res.status(400).json({ error: 'Prompt requerido' });
    }

    // Solo soportamos 'normal' en esta primera versión
    if (modo !== 'normal') {
      return res.status(400).json({ error: 'Modo no soportado en esta versión. Usa modo="normal".' });
    }

    // 1) 💳 Descontar 1 token antes de iniciar
    await consumirToken({
      userId,
      type: 'generation',
      tool: 'comfyui',
      description: 'Texto→Imagen (FLUX normal)'
    });

    const flujoBase = flujosCargados?.normal;
    if (!flujoBase) throw new Error('Flujo "normal" no cargado');

    const flujo = clonar(flujoBase);
    const [width, height] = proporciones[ratio] || proporciones['1:1'];

    // Normalizamos seed (puede venir string)
    const seedNum = Number(seed);
    const seedInt = Number.isFinite(seedNum) ? Math.trunc(seedNum) : undefined;

    // --- semilla ---
    // si el usuario la escribe, usamos esa; si no, generamos una nueva cada vez
    const hasSeed =
    seed !== undefined &&
    seed !== null &&
    String(seed).trim() !== '' &&
    Number.isFinite(Number(seed));

    const seedToUse = hasSeed
    ? Math.trunc(Number(seed))
    : crypto.randomInt(0, 2 ** 31 - 1); // nueva aleatoria cada submit
    // arriba del archivo o en un util
    const sanitizeLoraName = (s) => {
    if (!s) return s;
    return String(s)
        .normalize('NFC')       // normaliza unicode
        .replace(/\\/g, '/')    // <-- convierte \ a /
        .replace(/^\.\//, '')   // quita ./ al principio
        .replace(/^\/+/, '')    // quita / iniciales
        .replace(/\/{2,}/g, '/')// colapsa // en /
        .trim();
    };

    let resolvedLoraName = loraName ? sanitizeLoraName(loraName) : undefined;

    // (opcional pero útil) deja un log claro:
    if (resolvedLoraName) {
    console.log('[LoraName] solicitado:', loraName, '→ saneado:', resolvedLoraName);
    }

    
    // 🔧 Parcheo EXACTO para flux_keiko.json con LoRA controlable
    const changes = patchFluxNormal(flujo, {
    prompt,
    width,
    height,
    steps: stepsSafe,
    seed: seedToUse,                // 👈 siempre fijamos semilla
    filename_prefix,
    forceLoraStrength: false, // ahora dejamos que lo mande el frontend
    lora: resolvedLoraName  || loraTrigger || typeof loraStrengthModel === 'number' || typeof loraStrengthClip === 'number'
        ? {
            name: resolvedLoraName || undefined,
            trigger: loraTrigger || undefined,
            strength_model: (typeof loraStrengthModel === 'number') ? loraStrengthModel : undefined,
            strength_clip: (typeof loraStrengthClip === 'number') ? loraStrengthClip : undefined,
            insertMode: loraInsertMode || 'prefix'
        }
        : null
    });
    console.log('[Texto→Imagen normal] Cambios aplicados:', changes);

    // Creamos Job (tokens ya debitados por middleware)
    const job = await Text2ImageJob.create({
        user: userId,
        prompt,
        params: {
            ratio,
            steps: stepsSafe, 
            seed: seedToUse,              // 👈 queda registrada para auditoría
            filename_prefix,
            modo: 'normal',
            lora: loraName ? {
            name: loraName,
            trigger: loraTrigger || null,
            strength_model: (typeof loraStrengthModel === 'number') ? loraStrengthModel : null,
            strength_clip: (typeof loraStrengthClip === 'number') ? loraStrengthClip : null,
            insertMode: loraInsertMode || 'prefix'
            } : null
        },
        status: 'pendiente',
        tokenCost,
        tokensDebited: true
        });

    // Enviar a ComfyUI
    const comfyUrl = await getComfyUrl();
    const authHeaders = await getComfyAuth();
    const clientId = crypto.randomUUID();

    const { data } = await axios.post(
      `${comfyUrl}/prompt`,
      { prompt: flujo, client_id: clientId },
      { headers: authHeaders, timeout: 60_000 }
    );

    job.status = 'en_proceso';
    job.clientId = clientId;
    job.queueId = data?.prompt_id ?? null;
    await job.save();

    // 👉 registra en el watcher para que tenga posición en cola desde el minuto 0
    if (job.queueId) {
        trackPendingJob(String(job.queueId).toLowerCase(), {
        jobId: job._id.toString(),
        userId: userId?.toString?.() || userId,
        clientId,
        });
    }
    
    return res.json({
      ok: true,
      imageId: job._id.toString(), // alias por compatibilidad
      jobId: job._id.toString()
    });
  } catch (err) {
    console.error('[iniciarTextoImagen] ERROR:', err?.message || err);
    // Rollback de tokens si el débito ya ocurrió
    // 🔁 Rollback: si ya descontamos token en este flujo, reembolsa 1
    try {
        await reembolsarToken({ userId: req.user._id, reason: 'Rollback Texto→Imagen' });
        } catch (e) {
        console.warn('[tokens] fallo al reembolsar:', e?.message || e);
        }
    return res.status(500).json({ error: 'No se pudo iniciar la generación', detail: err?.message || String(err) });
  }
};

export const estadoTextoImagen = async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!jobId) return res.status(400).json({ error: 'ID requerido' });

    const job = await Text2ImageJob.findOne({ _id: jobId, user: req.user._id });
    if (!job) return res.status(404).json({ error: 'No encontrado' });

    // 👇 evita 304/not modified del navegador y proxies
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    // 🔎 leer progreso en watcher por prompt_id (queueId)
    const promptId = job?.queueId ? String(job.queueId).toLowerCase() : null;
    const watcher = promptId ? getJobStatus(promptId) : null;
    // watcher?.progress es 0..1 → pasar a 0..100
    let progress = typeof watcher?.progress === 'number'
        ? Math.max(0, Math.min(100, Math.round(watcher.progress * 100)))
        : null;
    // cola (si el watcher la calcula)
    const colaIndex = Number.isFinite(watcher?.colaIndex) ? watcher.colaIndex : null;

    // si el job está completado en BD, fuerza 100
    const status = job.status || 'en_proceso';
    if (status === 'completada') progress = 100;

    return res.status(200).json({
      ok: true,
      id: jobId,
      status,
      finalUrl: job.finalUrl,
      url: job.url,
      filename: job.filename,
      createdAt: job.createdAt,
      params: job.params,
      progress,     // 0..100 | null
      colaIndex     // número o null
    });
  } catch (err) {
    console.error('[estadoTextoImagen] ERROR:', err?.message || err);
    return res.status(500).json({ error: 'No se pudo consultar el estado', detail: err?.message || String(err) });
  }
};

// ================================
// NUEVO: listarMisImagenes (últimos 30 días, filtrable)
// GET /api/imagenes/mias?from=ISO&to=ISO&limit=120&status=completada
// ================================
export const listarMisImagenes = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });

    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const { from, to, limit = '120', status = 'completada' } = req.query || {};
    const now = new Date();
    const parseISO = (v, fb) => { const d = v ? new Date(v) : fb; return Number.isFinite(+d) ? d : fb; };

    const fromDate = parseISO(from, new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
    const toDate   = parseISO(to, now);
    const limitNum = Math.max(1, Math.min(500, parseInt(limit, 10) || 120));

    const query = {
      user: req.user._id,
      createdAt: { $gte: fromDate, $lte: toDate },
      ...(status && status !== 'all' ? { status } : {}),
    };

    const jobs = await Text2ImageJob.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .select('_id prompt params status filename url finalUrl createdAt updatedAt tokenCost tokensDebited clientId queueId')
      .lean();

    const items = (jobs || [])
      .map(j => ({
        id: String(j._id),
        prompt: j.prompt || '',
        params: j.params || {},           // ⬅️ la configuración
        status: j.status || 'pendiente',
        filename: j.filename || null,
        url: j.finalUrl || j.url || null, // el grid usa "url"
        finalUrl: j.finalUrl || null,
        createdAt: j.createdAt || null,
        updatedAt: j.updatedAt || null,
        tokenCost: j.tokenCost ?? 1,
        tokensDebited: !!j.tokensDebited,
        clientId: j.clientId || null,
        queueId: j.queueId || null,
      }))
      .filter(x => x.url);

    return res.status(200).json({ ok: true, items });
  } catch (err) {
    console.error('[listarMisImagenes] ERROR:', err?.message || err);
    return res.status(200).json({ ok: true, items: [] });
  }
};