import cron from 'node-cron';
import enrichNextLaunch from '../scripts/enrichNextLaunch.js';

export function startEnrichSpacexJob() {
  console.log('[CRON INIT] ⏰ EnrichSpacexJob iniciado');
  
  cron.schedule('*/20 * * * *', async () => {
    console.log('[CRON] ⏱ Enriqueciendo un lanzamiento pendiente...');
    try {
      await enrichNextLaunch();
      console.log('[CRON] ✅ Enriquecimiento completado.');
    } catch (err) {
      console.error('[CRON] ❌ Error al enriquecer lanzamiento:', err.message);
    }
  });
}