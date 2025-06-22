import WebSocket from 'ws';
import { getComfyUrl } from '../services/comfyService.js';
import { getComfyAuth } from '../utils/comfyAuth.js';
import { manejarFinalizacionDeJob } from '../services/manejoResultadoImagen.js';

const jobStatusMap = new Map();

export const getJobStatus = (promptId) => {
  const id = String(promptId).trim().toLowerCase(); // 💡 normalización aquí también
  return jobStatusMap.get(id) || null;
};

// 🔁 Limpieza automática de jobs finalizados
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // cada 5 minutos
const JOB_TTL_MS = 10 * 60 * 1000; // mantener 10 minutos tras terminar

setInterval(() => {
  const now = Date.now();
  for (const [promptId, job] of jobStatusMap.entries()) {
    if (
      job.status === 'finished' &&
      now - job.createdAt > JOB_TTL_MS
    ) {
      jobStatusMap.delete(promptId);
    }
  }
}, CLEANUP_INTERVAL_MS);

export const startComfySocketWatcher = async () => {
  const comfyUrl = await getComfyUrl('flux');
  const wsUrl = comfyUrl.replace(/^http/, 'ws') + '/ws';
  const { auth } = getComfyAuth();

  const connect = () => {
    const ws = new WebSocket(wsUrl, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${auth.username}:${auth.password}`).toString('base64')
      }
    });

    ws.on('open', () => console.log('✅ WebSocket conectado a ComfyUI'));

    ws.on('message', (msg) => {
      try {
        const text = Buffer.isBuffer(msg) ? msg.toString('utf-8') : msg;

        // Validar que el texto parezca un JSON (empieza con { o [)
        if (!text || typeof text !== 'string' || !/^[\[{]/.test(text.trim())) return;

        const event = JSON.parse(text);
        // console.log('📡 Evento recibido:', event);
        console.dir(event, { depth: null });

        if (!event?.type) return;

        const rawId = event.prompt_id || event.data?.prompt_id;
        if (!rawId) return;

        const promptId = String(rawId).trim().toLowerCase(); // 🔧 normalizamos

        switch (event.type) {
          

          case 'progress':
            if (jobStatusMap.has(promptId)) {
              const value = event.data?.value ?? event.value ?? 0;
              const max = event.data?.max ?? event.max ?? 20;
              const progress = value / max;

              const previous = jobStatusMap.get(promptId);

              const updated = {
                ...previous,
                progress
              };

              // Si aún no estaba marcado como en ejecución
              if (previous.status === 'queued') {
                updated.status = 'running';
                updated.inQueue = false;
                updated.startedAt = previous.startedAt || Date.now();
              }

              jobStatusMap.set(promptId, updated);
              // console.log('🔄 Actualizando job:', promptId, `(${Math.round(progress * 100)}%)`);
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

              manejarFinalizacionDeJob(promptId, previous); // ⚡ lanza el proceso de subida + actualización
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
  };

  connect();
};

export const getAllJobs = () => {
  // 🧮 Calculamos la cola actual, ordenada por tiempo de creación
  const queue = Array.from(jobStatusMap.entries())
    .filter(([, data]) => data.status === 'queued')
    .sort((a, b) => (a[1].createdAt || 0) - (b[1].createdAt || 0));

  // 🔁 Creamos lista con cada job incluyendo su posición (si está en cola)
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
    .sort((a, b) => (a[1].createdAt || 0) - (b[1].createdAt || 0)) // ordenados por tiempo

  return queue.findIndex(([id]) => id === promptId) + 1; // +1 para que empiece en 1
};