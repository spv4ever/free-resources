// src/services/generarImagenOptimizada.js

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import axios from 'axios';
import { getComfyUrl } from './comfyService.js';
import { getComfyAuth } from '../utils/comfyAuth.js';
import { trackPendingJob } from '../services/comfySocketWatcher.js'; // ajusta la ruta si es necesario
import { flujosCargados } from '../config/flujosCargados.js';
import crypto from 'crypto';
import { uploadBufferToCloudinary } from './cloudinary.js'; // o la ruta correcta

const clonarFlujo = (flujoBase) => JSON.parse(JSON.stringify(flujoBase));

const proporciones = {
  '1:1': [1024, 1024],
  '2:3': [768, 1152],
  '3:4': [768, 1024],
  '16:9': [1280, 720],
  '9:16': [720, 1280],
};

const resolucionesOptimizadas = {
  '1:1': [768, 768],
  '2:3': [512, 768],
  '3:4': [576, 768],
  '4:3': [768, 576],
  '5:4': [640, 512],
  '16:9': [896, 512],
  '9:16': [512, 896],
  '21:9': [1024, 448]
};


export const generarImagenOptimizada = async ({
  prompt,
  ratio = '16:9',
  seed = null,
  steps = 18,
  filename_prefix = 'keiko',
}) => {
  if (!prompt) throw new Error('El prompt es obligatorio');

  const modificado = clonarFlujo(flujosCargados.normal);
  const [width, height] = resolucionesOptimizadas[ratio] || resolucionesOptimizadas['4:3'];

  modificado['1'].inputs.width = width;
  modificado['1'].inputs.height = height;
  modificado['13'].inputs.string = prompt;
  modificado['12'].inputs.noise_seed = seed || Math.floor(Math.random() * 1e16);
  modificado['10'].inputs.steps = Math.min(steps, 30);
  modificado['30'].inputs.filename_prefix = filename_prefix;

  // Redirigir imagen generada directamente (sin upscale)
  modificado['30'].inputs.images = ['3', 0];

  const comfyUrl = await getComfyUrl('flux');
  const { data } = await axios.post(`${comfyUrl}/prompt`, { prompt: modificado }, getComfyAuth());

  if (data?.prompt_id) {
    trackPendingJob(data.prompt_id);
  }

  return data;
};

export const generarImagenAvanzada = async ({
  prompt,
  ratio = '1:1',
  seed = null,
  steps = 15,
  filename_prefix = 'keiko',
  removeBackground = false
}) => {
  if (!prompt) throw new Error('El prompt es obligatorio');

  const modificado = clonarFlujo(flujosCargados.pro);
  const [width, height] = resolucionesOptimizadas[ratio] || resolucionesOptimizadas['4:3'];

  modificado['1'].inputs.width = width;
  modificado['1'].inputs.height = height;
  modificado['13'].inputs.string = prompt;
  modificado['12'].inputs.noise_seed = seed || Math.floor(Math.random() * 1e16);
  modificado['10'].inputs.steps = Math.min(steps, 30);
  modificado['30'].inputs.filename_prefix = filename_prefix;

  // Redirigir según si se desea eliminar fondo
  modificado['30'].inputs.images = removeBackground ? ['31', 0] : ['29', 0];

  const comfyUrl = await getComfyUrl('flux');
  const { data } = await axios.post(`${comfyUrl}/prompt`, { prompt: modificado }, getComfyAuth());

  if (data?.prompt_id) {
    trackPendingJob(data.prompt_id);
  }

  return data;
};

export const generarImagenStickers = async ({
  prompt,
  ratio = '3:4',
  seed = null,
  steps = 30,
  filename_prefix = 'keiko',
  removeBackground = false
}) => {
  if (!prompt) throw new Error('El prompt es obligatorio');

  const modificado = clonarFlujo(flujosCargados.stickers);
  const [width, height] = resolucionesOptimizadas[ratio] || resolucionesOptimizadas['3:4'];

  if (modificado['6']) {
    modificado['6'].inputs.width = width;
    modificado['6'].inputs.height = height;
  }

  if (modificado['3']) {
    modificado['3'].inputs.text = prompt;
  }

  if (modificado['5']) {
    modificado['5'].inputs.seed = seed || Math.floor(Math.random() * 1e16);
    modificado['5'].inputs.steps = Math.min(steps, 30);
  }

  if (modificado['28']) {
    modificado['28'].inputs.filename_prefix = filename_prefix;
  }

  if (!removeBackground) {
    // Si no queremos borrar el fondo:
    // 1. Eliminamos el nodo 19 (Remove Background)
    delete modificado['19'];

    // 2. Cambiamos la entrada del nodo 28 para que tome la imagen del nodo 7 directamente
    if (modificado['28']) {
      modificado['28'].inputs.images = ["7", 0];
    }
  } else {
    // Si queremos borrar fondo, dejamos la imagen que viene de 19 en el nodo 28
    if (modificado['28']) {
      modificado['28'].inputs.images = ["19", 0];
    }
  }

  const comfyUrl = await getComfyUrl('flux');
  const { data } = await axios.post(`${comfyUrl}/prompt`, { prompt: modificado }, getComfyAuth());

  if (data?.prompt_id) {
    trackPendingJob(data.prompt_id);
  }

  return data;
};

export const generarImagen = async ({
  prompt,
  ratio,
  seed,
  steps,
  filename_prefix,
  advancedMode = false,
  removeBackground = false,
  category = ''
}) => {
  const esSticker = ['Stickers', 'T-Shirt'].includes(category);
  const esAnime = category === 'Anime';

  if (esSticker) {
    return generarImagenStickers({ prompt, ratio, seed, steps, filename_prefix, removeBackground });
  }

  if (esAnime) {
    return generarImagenAnime({ prompt, ratio, seed, steps, filename_prefix });
  }

  if (advancedMode) {
    return generarImagenAvanzada({ prompt, ratio, seed, steps, filename_prefix, removeBackground });
  }

  return generarImagenOptimizada({ prompt, ratio, seed, steps, filename_prefix });
};

export const generarImagenAnime = async ({
  prompt,
  ratio = '3:4',
  seed = null,
  steps = 30,
  filename_prefix = 'keiko'
}) => {
  if (!prompt) throw new Error('El prompt es obligatorio');

  const modificado = clonarFlujo(flujosCargados.anime);
  const [width, height] = resolucionesOptimizadas[ratio] || resolucionesOptimizadas['3:4'];

  // 1. Asignar dimensiones al nodo 6 (EmptyLatentImage)
  if (modificado['6']) {
    modificado['6'].inputs.width = width;
    modificado['6'].inputs.height = height;
  }

  // 2. Asignar prompt positivo al nodo 3 (CLIPTextEncode)
  if (modificado['3']) {
    modificado['3'].inputs.text = prompt;
  }

  // 3. Asignar semilla y pasos al nodo 5 (KSampler)
  if (modificado['5']) {
    modificado['5'].inputs.seed = seed || Math.floor(Math.random() * 1e16);
    modificado['5'].inputs.steps = Math.min(steps, 30);
  }

  // 4. Asignar nombre del archivo al nodo 17 (SaveImage)
  if (modificado['17']) {
    modificado['17'].inputs.filename_prefix = filename_prefix;
  }

  const comfyUrl = await getComfyUrl('flux');
  const { data } = await axios.post(`${comfyUrl}/prompt`, { prompt: modificado }, getComfyAuth());

  if (data?.prompt_id) {
    trackPendingJob(data.prompt_id);
  }

  return data;
};

export const generarImagenRMBG = async ({ imageBuffer, filenameRMBG  }) => {
  if (!imageBuffer) throw new Error('Image buffer es obligatorio');

  // 1. Subir la imagen a Cloudinary (en carpeta keiko/remove-bg)
  const publicId = `keiko/remove-bg/input_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const uploadResult = await uploadBufferToCloudinary(imageBuffer, publicId);
  console.log({filenameRMBG});
  // 2. Clonar el flujo RMBG y reemplazar la URL en el nodo 16
  const modificado = clonarFlujo(flujosCargados.rmbg);
  modificado["16"].inputs.url = uploadResult.secure_url;
  modificado['8'].inputs.filename_prefix = filenameRMBG;

  // 3. Enviar flujo a ComfyUI
  const comfyUrl = await getComfyUrl('flux');
  const { data } = await axios.post(`${comfyUrl}/prompt`, { prompt: modificado }, getComfyAuth());

  // 4. Trackear job pendiente para polling
  if (data?.prompt_id) {
    trackPendingJob(data.prompt_id);
  }

  return { prompt_id: data.prompt_id, inputUrl: uploadResult.secure_url };
};