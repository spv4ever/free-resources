import axios from 'axios';
import { getComfyUrl } from './comfyService.js';

export const consultarImagenGenerada = async (prompt_id, maxRetries = 40, delayMs = 10000) => {
  if (!prompt_id) throw new Error('Se requiere el prompt_id');

  const comfyUrl = await getComfyUrl('flux');

  for (let intento = 0; intento < maxRetries; intento++) {
    try {
      console.log(`🌀 Intento ${intento + 1} de ${maxRetries} → Consultando imagen...`);
      const { data } = await axios.get(`${url}/history/${prompt_id}`, {
                        auth: {
                            username: process.env.COMFY_AUTH_USER,
                            password: process.env.COMFY_AUTH_PASS
                        }
                        });
      const entry = data[prompt_id] || data;
      const nodoSalida = entry.outputs?.['30'];

      if (nodoSalida && nodoSalida.images?.length) {
        const { filename } = nodoSalida.images[0];
        const imageUrl = `${comfyUrl}/view?filename=output/${filename}`;
        return { filename, imageUrl };
      }
    } catch (err) {
      console.warn(`⚠️ Fallo al consultar prompt_id ${prompt_id}: ${err.message}`);
    }

    await new Promise(res => setTimeout(res, delayMs));
  }

  throw new Error('La imagen aún no está disponible tras varios intentos');
};
