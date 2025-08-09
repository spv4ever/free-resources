// src/controllers/text2imageController.js
import axios from 'axios';
import crypto from 'crypto';
import Text2ImageJob from '../models/Text2ImageJob.js';
import { flujosCargados } from '../config/flujosCargados.js';
import { getComfyUrl } from '../services/comfyService.js';
import { getComfyAuth } from '../utils/comfyAuth.js';
import { rollbackDebit } from '../utils/tokenRollback.js';
import { patchFluxNormal } from '../utils/patchFluxNormal.js';
import { resolveComfyLoraName } from '../utils/resolveComfyLora.js';

const proporciones = {
  '1:1': [1024, 1024],
  '2:3': [768, 1152],
  '3:4': [768, 1024],
  '16:9': [1280, 720],
  '9:16': [720, 1280],
};

const clonar = (obj) => JSON.parse(JSON.stringify(obj));

export const iniciarTextoImagen = async (req, res) => {
  const userId = req.user._id;
  const tokenCost = req.__tokenCost || 1;
  const tokenTxId = req.__tokenTxId;

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

    if (!prompt?.trim()) {
      return res.status(400).json({ error: 'Prompt requerido' });
    }

    // Solo soportamos 'normal' en esta primera versión
    if (modo !== 'normal') {
      return res.status(400).json({ error: 'Modo no soportado en esta versión. Usa modo="normal".' });
    }

    const flujoBase = flujosCargados?.normal;
    if (!flujoBase) throw new Error('Flujo "normal" no cargado');

    const flujo = clonar(flujoBase);
    const [width, height] = proporciones[ratio] || proporciones['1:1'];

    // Normalizamos seed (puede venir string)
    const seedNum = Number(seed);
    const seedInt = Number.isFinite(seedNum) ? Math.trunc(seedNum) : undefined;
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
    steps: Number(steps) || 20,
    seed: Number.isInteger(seedInt) ? seedInt : undefined,
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
            steps: Number(steps) || 20,
            seed: Number.isInteger(seedInt) ? seedInt : null,
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

    return res.json({
      ok: true,
      imageId: job._id.toString(), // alias por compatibilidad
      jobId: job._id.toString()
    });
  } catch (err) {
    console.error('[iniciarTextoImagen] ERROR:', err?.message || err);
    // Rollback de tokens si el débito ya ocurrió
    try { await rollbackDebit(userId, tokenTxId, tokenCost); } catch (e) { /* noop */ }
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

    return res.status(200).json({
      status: job.status,
      finalUrl: job.finalUrl,
      url: job.url,
      filename: job.filename,
      createdAt: job.createdAt,
      params: job.params
    });
  } catch (err) {
    console.error('[estadoTextoImagen] ERROR:', err?.message || err);
    return res.status(500).json({ error: 'No se pudo consultar el estado', detail: err?.message || String(err) });
  }
};
