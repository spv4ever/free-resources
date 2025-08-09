import WebSocket from 'ws';
import axios from 'axios';
import { getComfyUrl } from '../services/comfyService.js';
import { getComfyAuth } from '../utils/comfyAuth.js';
import { manejarFinalizacionDeJob } from '../services/manejoResultadoImagen.js';
import { verificarImagen } from '../controllers/fluxController.js';
import { finalizeText2ImageByPromptId } from '../services/text2imageFinalize.js';

const jobStatusMap = new Map();

export const getJobStatus = (promptId) => {
  const id = String(promptId).trim().toLowerCase();
  return jobStatusMap.get(id) || null;
};

// 🔁 Limpieza automática de jobs finalizados
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const JOB_TTL_MS = 10 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [promptId, job] of jobStatusMap.entries()) {
    if (job.status === 'finished' && now - job.createdAt > JOB_TTL_MS) {
      jobStatusMap.delete(promptId);
    }
  }
}, CLEANUP_INTERVAL_MS);

export const startComfySocketWatcher = () => {
  connect();
};

const connect = async () => {
  try {
    const comfyUrl = await getComfyUrl('flux');
    const wsUrl = comfyUrl.replace(/^http/, 'ws') + '/ws';
    const { auth } = getComfyAuth();

    const ws = new WebSocket(wsUrl, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${auth.username}:${auth.password}`).toString('base64')
      }
    });

    ws.on('open', () => console.log('✅ WebSocket conectado a ComfyUI'));

    ws.on('message', (msg) => {
      try {
        const text = Buffer.isBuffer(msg) ? msg.toString('utf-8') : msg;
        if (!text || typeof text !== 'string' || !/^[\[{]/.test(text.trim())) return;

        const event = JSON.parse(text);
        console.dir(event, { depth: null });

        if (!event?.type) return;

        const rawId = event.prompt_id || event.data?.prompt_id;
        if (!rawId) return;

        const promptId = String(rawId).trim().toLowerCase();

        switch (event.type) {
          case 'progress':
            if (jobStatusMap.has(promptId)) {
              const value = event.data?.value ?? event.value ?? 0;
              const max = event.data?.max ?? event.max ?? 20;
              const progress = value / max;

              const previous = jobStatusMap.get(promptId);
              const updated = { ...previous, progress };

              if (previous.status === 'queued') {
                updated.status = 'running';
                updated.inQueue = false;
                updated.startedAt = previous.startedAt || Date.now();
              }

              jobStatusMap.set(promptId, updated);

              if (value === max && updated.status !== 'finished') {
                console.log(`✅ Job completado por progreso (${promptId})`);

                jobStatusMap.set(promptId, {
                  ...updated,
                  status: 'finished',
                  progress: 1,
                  inQueue: false,
                  finishedAt: Date.now()
                });
                finalizeText2ImageByPromptId(promptId).catch(e => console.error('❌ finalizeText2Image error:', e.message));
                esperarYVerificarImagen(promptId);
              }
            }
            break;
          case 'progress_state':
            if (!event.data?.nodes) return;

            // 🛡️ Si el job aún no existe, lo inicializamos como si lo hubiera hecho trackPendingJob
            if (!jobStatusMap.has(promptId)) {
              const colaIndex = calcularPosicionEnCola(promptId);
              jobStatusMap.set(promptId, {
                status: 'running',
                progress: 0,
                inQueue: false,
                createdAt: Date.now(),
                startedAt: Date.now(),
                colaIndex
              });
            }

            const previous = jobStatusMap.get(promptId);
            const nodes = event.data.nodes;

            // ✅ Solo contar nodos con max > 1 (los que realmente consumen tiempo, como denoise)
            const progressNodes = Object.values(nodes).filter(n => n.max > 1);
            const totalValue = progressNodes.reduce((sum, n) => sum + (n.value || 0), 0);
            const totalMax = progressNodes.reduce((sum, n) => sum + (n.max || 1), 0);
            const progress = totalMax > 0 ? totalValue / totalMax : 0;

            const updated = {
              ...previous,
              progress,
              status: 'running',
              inQueue: false,
              startedAt: previous?.startedAt || Date.now()
            };

            jobStatusMap.set(promptId, updated);

            // ✅ Si todos los nodos están en estado "finished", marcamos el job como terminado
            const allFinished = Object.values(nodes).every(n => n.state === 'finished');
            if (allFinished && updated.status !== 'finished') {
              console.log(`✅ Job completado por progress_state (${promptId})`);
              jobStatusMap.set(promptId, {
                ...updated,
                status: 'finished',
                progress: 1,
                inQueue: false,
                finishedAt: Date.now()
              });
              finalizeText2ImageByPromptId(promptId).catch(e => console.error('❌ finalizeText2Image error:', e.message));
              esperarYVerificarImagen(promptId);
            }
            break;

          case 'execution_end':
            if (jobStatusMap.has(promptId)) {
              const previous = jobStatusMap.get(promptId);
                

              jobStatusMap.set(promptId, {
                ...previous,
                status: 'finished',
                progress: 1,
                inQueue: false,
                finishedAt: Date.now()
              });

              manejarFinalizacionDeJob(promptId, previous);
              finalizeText2ImageByPromptId(promptId).catch(e => console.error('❌ finalizeText2Image error:', e.message));
            }
            break;
        }
      } catch (err) {
        console.error('❌ Error procesando mensaje WebSocket:', err.message);
      }
    });

    ws.on('close', () => {
      console.log('🔁 WebSocket cerrado. Reintentando en 5s...');
      setTimeout(connect, 5000);
    });

    ws.on('error', (err) => {
      console.error('❌ WebSocket error:', err.message);
      ws.close();
    });
  } catch (err) {
    console.error('❌ Error general conectando al WebSocket:', err.message);
    setTimeout(connect, 5000);
  }
};

export const getAllJobs = () => {
  const queue = Array.from(jobStatusMap.entries())
    .filter(([, data]) => data.status === 'queued')
    .sort((a, b) => (a[1].createdAt || 0) - (b[1].createdAt || 0));

  return Array.from(jobStatusMap.entries()).map(([promptId, data]) => {
    const colaIndex = data.status === 'queued'
      ? queue.findIndex(([id]) => id === promptId) + 1
      : null;

    return {
      promptId,
      ...data,
      progress: data.progress || 0,
      colaIndex
    };
  });
};

export const trackPendingJob = (promptId, meta = {}) => {
  const id = String(promptId).trim().toLowerCase();
  const colaIndex = calcularPosicionEnCola(id);

  jobStatusMap.set(id, {
    status: 'queued',
    progress: 0,
    inQueue: true,
    createdAt: Date.now(),
    colaIndex,
    ...meta
  });
};

const calcularPosicionEnCola = (promptId) => {
  const queue = Array.from(jobStatusMap.entries())
    .filter(([, data]) => data.status === 'queued')
    .sort((a, b) => (a[1].createdAt || 0) - (b[1].createdAt || 0));

  return queue.findIndex(([id]) => id === promptId) + 1;
};

export const esperarYVerificarImagen = async (promptId, intentos = 10, delay = 1000) => {
  const comfyUrl = await getComfyUrl('flux');

  for (let i = 0; i < intentos; i++) {
    try {
      const { data } = await axios.get(`${comfyUrl}/history/${promptId}`, getComfyAuth());
      const entry = data[promptId] || data;
      const nodoSalida = Object.values(entry.outputs || {}).find(n => n?.images?.length > 0);

      if (nodoSalida && nodoSalida.images.length > 0) {
        console.log(`🧠 Imagen detectada tras ${i + 1} intento(s). Ejecutando verificación...`);
        await verificarImagen({ params: { id: promptId } }, {
          json: () => {},
          status: () => ({ json: () => {} })
        });
        return;
      }
    } catch (e) {
      if (i === intentos - 1) {
        console.error(`❌ Error al verificar imagen tras ${intentos} intentos:`, e.message);
      }
    }

    await new Promise(r => setTimeout(r, delay));
  }
};

export { jobStatusMap };