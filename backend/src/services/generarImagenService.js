import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { getComfyUrl } from './comfyService.js';

const proporciones = {
  '1:1': [1024, 1024],
  '2:3': [768, 1152],
  '3:4': [768, 1024],
  '16:9': [1280, 720],
  '9:16': [720, 1280],
};

export const generarImagenConFlux = async ({
  prompt,
  ratio = '3:4',
  seed = null,
  steps = 30,
  filename_prefix = 'keiko',
}) => {
  if (!prompt) throw new Error('El prompt es obligatorio');

  const ruta = path.join(process.cwd(), 'src', 'modeloia', 'flux_keiko.json');
  const original = JSON.parse(fs.readFileSync(ruta, 'utf-8'));
  const modificado = JSON.parse(JSON.stringify(original));

  const [width, height] = proporciones[ratio] || proporciones['3:4'];

  modificado['1'].inputs.width = width;
  modificado['1'].inputs.height = height;
  modificado['13'].inputs.string = prompt;
  modificado['12'].inputs.noise_seed = seed || Math.floor(Math.random() * 1e16);
  modificado['30'].inputs.filename_prefix = filename_prefix;

  const defaultSteps = 30;
  modificado['10'].inputs.steps = steps < defaultSteps ? steps : defaultSteps;

  const url = await getComfyUrl('flux');
  const authHeader = {
    auth: {
        username: process.env.COMFY_AUTH_USER,
        password: process.env.COMFY_AUTH_PASS
    }
    };

    const { data } = await axios.post(`${url}/prompt`, { prompt: modificado }, authHeader);
  return data;
};
