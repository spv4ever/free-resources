// src/services/generarImagenOptimizada.js
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { getComfyUrl } from './comfyService.js';
import { getComfyAuth } from '../utils/comfyAuth.js';

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
  '16:9': [896, 504],
  '9:16': [504, 896],
  '21:9': [1050, 450]
};


export const generarImagenOptimizada = async ({
  prompt,
  ratio = '16:9',
  seed = null,
  steps = 18,
  filename_prefix = 'keiko',
}) => {
  if (!prompt) throw new Error('El prompt es obligatorio');

  const ruta = path.join(process.cwd(), 'src', 'modeloia', 'flux_keiko.json');
  const original = JSON.parse(fs.readFileSync(ruta, 'utf-8'));
  const modificado = JSON.parse(JSON.stringify(original));

  const [width, height] = resolucionesOptimizadas[ratio] || resolucionesOptimizadas['4:3'];

  // Aplicar ajustes
  modificado['1'].inputs.width = width;
  modificado['1'].inputs.height = height;
  modificado['13'].inputs.string = prompt;
  modificado['12'].inputs.noise_seed = seed || Math.floor(Math.random() * 1e16);
  modificado['30'].inputs.filename_prefix = filename_prefix;

  // Limitar steps a máximo 15
  modificado['10'].inputs.steps = Math.min(steps, 12);

  // Eliminar upscale para aceleración
  delete modificado['28'];
  delete modificado['29'];
  modificado['30'].inputs.images = ['3', 0];

  const comfyUrl = await getComfyUrl('flux');
  const { data } = await axios.post(`${comfyUrl}/prompt`, { prompt: modificado }, getComfyAuth());
  return data;
};
