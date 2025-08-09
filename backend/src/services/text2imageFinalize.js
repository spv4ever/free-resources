// src/services/text2imageFinalize.js
import axios from 'axios';
import path from 'path';
import Text2ImageJob from '../models/Text2ImageJob.js';
import { getComfyUrl } from '../services/comfyService.js';
import { getComfyAuth } from '../utils/comfyAuth.js';
import { uploadBufferToCloudinary } from './cloudinaryUploadBuffer.js';

function buildComfyViewUrl(base, { filename, subfolder = '', type = 'output' }) {
  const q = new URLSearchParams({ filename, subfolder, type });
  return `${base}/view?${q.toString()}`;
}

export async function finalizeText2ImageByPromptId(promptIdRaw) {
  if (!promptIdRaw) throw new Error('promptId requerido');

  const promptId = String(promptIdRaw).trim().toLowerCase();
  const comfyUrl = await getComfyUrl('flux');

  // 1) Busca el job por queueId (principal) o clientId (fallback)
  let job = await Text2ImageJob.findOne({ queueId: new RegExp(`^${promptId}$`, 'i') });
  if (!job) job = await Text2ImageJob.findOne({ clientId: new RegExp(`^${promptId}$`, 'i') });
  if (!job) {
    console.warn('[finalizeText2ImageByPromptId] Job no encontrado para promptId:', promptId);
    return null;
  }

  // 2) Lee history y toma la primera imagen de salida
  const { data: hist } = await axios.get(`${comfyUrl}/history/${promptId}`, getComfyAuth());
  const entry = hist[promptId] || hist;

  const outNode = Object.values(entry.outputs || {})
    .find(n => Array.isArray(n?.images) && n.images.length > 0);
  if (!outNode) {
    throw new Error('No se encontraron imágenes en el history');
  }

  const img = outNode.images[0]; // { filename, subfolder, type }
  const filename = img.filename;
  const subfolder = img.subfolder || '';
  const type = img.type || 'output';

  // 3) Descarga desde /view con auth
  const viewUrl = buildComfyViewUrl(comfyUrl, { filename, subfolder, type });
  const { auth } = getComfyAuth(); // { username, password }
  const fileResp = await axios.get(viewUrl, { responseType: 'arraybuffer', auth });
  const buffer = Buffer.from(fileResp.data);

  // 4) Sube a Cloudinary (con nombre legible)
  const baseName = path.parse(filename).name;
  const publicId = `t2i_${job._id}_${baseName}`;
  const up = await uploadBufferToCloudinary(buffer, {
    folder: 'recursos_free_resources/texto-a-imagen',
    public_id: publicId,
    transformations: { width: 800, crop: 'limit', quality: 'auto' }
  });

  // 5) Guarda en el job
  await Text2ImageJob.findByIdAndUpdate(job._id, {
    status: 'completada',
    filename,
    finalUrl: up.secure_url
  });

  return { jobId: job._id.toString(), finalUrl: up.secure_url, filename };
}
