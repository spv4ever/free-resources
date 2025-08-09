// src/controllers/generacionController.js
import axios from 'axios';
import crypto from 'crypto';
import ImagenGenerada from '../models/ImagenGenerada.js';
import { flujosCargados } from '../config/flujosCargados.js';
import { getComfyUrl } from '../services/comfyService.js';
import { getComfyAuth } from '../utils/comfyAuth.js';

const proporciones = {
  '1:1': [1024, 1024],
  '2:3': [768, 1152],
  '3:4': [768, 1024],
  '16:9': [1280, 720],
  '9:16': [720, 1280],
};

const clonarFlujo = (base) => {
  if (!base) throw new Error('Flujo base no cargado (flujosCargados.* es undefined)');
  return JSON.parse(JSON.stringify(base));
};

export const generarTextoImagen = async (req, res) => {
  const ctx = 'generarTextoImagen';
  try {
    const { prompt, ratio = '1:1', steps = 20, seed, filename_prefix = 'keiko', modo } = req.body || {};

    if (!prompt?.trim()) return res.status(400).json({ error: 'Prompt requerido' });

    // 1) Elegir flujo por modo: 'normal' por defecto
    const key = modo && flujosCargados[modo] ? modo : 'normal';
    console.log('🧩 flujosCargados keys:', Object.keys(flujosCargados));
    console.log('🧩 usando flujo:', key);

    const flujoBase = flujosCargados[key];
    const flujo = clonarFlujo(flujoBase);

    // 2) Dimensiones
    const [width, height] = proporciones[ratio] || proporciones['1:1'];

    // 3) Ajustes de nodos (pon nombres REALES de tu JSON)
    // Usa asignaciones seguras; si un nodo no existe, no rompe.
    if (flujo['Prompt']?.inputs) flujo['Prompt'].inputs.text = prompt;

    if (flujo['KSampler']?.inputs) {
      flujo['KSampler'].inputs.width = width;
      flujo['KSampler'].inputs.height = height;
      flujo['KSampler'].inputs.steps = steps ?? 20;
      if (Number.isInteger(seed)) flujo['KSampler'].inputs.seed = seed;
    }

    if (flujo['SaveImage']?.inputs) {
      flujo['SaveImage'].inputs.filename_prefix = filename_prefix;
    }

    // Ejemplo si tu flujo tiene control de strength_model
    if (flujo['SomeModelNode']?.inputs?.strength_model !== undefined) {
      flujo['SomeModelNode'].inputs.strength_model = 1.0;
    }

    // 4) Registro en DB
    const imagen = await ImagenGenerada.create({
      user: req.user?._id || null,
      prompt_id: null,
      prompt,
      filename: null,
      url: null,
      finalUrl: null,
      status: 'pendiente',
      createdAt: new Date(),
    });

    // 5) Enviar a ComfyUI
    const comfyUrl = await getComfyUrl();
    const authHeaders = await getComfyAuth();
    const clientId = crypto.randomUUID();

    const { data } = await axios.post(
      `${comfyUrl}/prompt`,
      { prompt: flujo, client_id: clientId },
      { headers: authHeaders, timeout: 60_000 }
    );

    imagen.status = 'en_proceso';
    await imagen.save();

    return res.json({
      ok: true,
      imageId: imagen._id.toString(),
      clientId,
      queueId: data?.prompt_id ?? null,
    });
  } catch (err) {
    console.error('[generarTextoImagen] ERROR:', err?.message);
    return res.status(500).json({ error: 'No se pudo iniciar la generación', detail: err?.message });
  }
};

export const obtenerEstadoImagen = async (req, res) => {
  try {
    const imagen = await ImagenGenerada.findById(req.params.id);
    if (!imagen) return res.status(404).json({ error: 'No encontrada' });

    return res.json({
      status: imagen.status,   // pendiente | en_proceso | completada | error
      url: imagen.url,
      finalUrl: imagen.finalUrl, // Cloudinary definitiva si la tenéis
      filename: imagen.filename,
      createdAt: imagen.createdAt,
    });
  } catch (err) {
    console.error('Error obtenerEstadoImagen:', err?.message);
    return res.status(500).json({ error: 'No se pudo consultar el estado' });
  }
};
