// src/utils/resolveComfyLora.js
import axios from 'axios';

const norm = (s) => String(s).trim().replace(/\\/g, '/').toLowerCase();

export async function resolveComfyLoraName({ comfyUrl, authHeaders, wanted }) {
  // 1) saca lista de loras desde Comfy
  let choices = [];
  try {
    const { data } = await axios.get(`${comfyUrl}/object_info`, { headers: authHeaders, timeout: 10000 });
    const c1 = data?.LoraLoader?.input?.required?.lora_name?.[1];
    const c2 = data?.LoraLoader?.input?.lora_name?.[1];
    if (Array.isArray(c1)) choices = c1;
    else if (Array.isArray(c2)) choices = c2;
  } catch (e) {
    // si falla, devolvemos wanted sin validar (último recurso)
    return { resolved: wanted, available: null };
  }

  const wantedStr = String(wanted || '').trim();
  if (!wantedStr) return { resolved: null, available: choices };

  // probamos variantes
  const posix = wantedStr.replace(/\\/g, '/');
  const win = wantedStr.replace(/\//g, '\\');
  const base = posix.split('/').pop();

  // buscamos coincidencia exacta primero
  let hit = choices.find(x => x === wantedStr)
        || choices.find(x => x === posix)
        || choices.find(x => x === win);

  // si no, por basename (al final de ruta, con / o \)
  if (!hit) {
    hit = choices.find(x => norm(x).endsWith('/' + base.toLowerCase()))
       || choices.find(x => x.toLowerCase().endsWith('\\' + base.toLowerCase()))
       || choices.find(x => x.toLowerCase() === base.toLowerCase());
  }

  return { resolved: hit || null, available: choices };
}
