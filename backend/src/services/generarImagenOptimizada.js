// src/services/generarImagenOptimizada.js
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { getComfyUrl } from './comfyService.js';
import { getComfyAuth } from '../utils/comfyAuth.js';
import { trackPendingJob } from '../services/comfySocketWatcher.js'; // ajusta la ruta si es necesario
import { flujosCargados } from '../config/flujosCargados.js';

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