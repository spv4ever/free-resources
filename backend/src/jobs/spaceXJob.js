
import cron from 'node-cron';
import { updateSpacexLaunches } from '../controllers/spacexController.js';

cron.schedule('0 * * * *', async () => {
  console.log('[CRON] Actualizando lanzamientos de SpaceX...');
  try {
    await updateSpacexLaunches();
    console.log('[CRON] Actualización completada.');
  } catch (err) {
    console.error('[CRON] Error actualizando lanzamientos:', err.message);
  }
});

// ¿Qué significa '0 * * * *'?
// El primer 0 indica el minuto 0.

// El * en la posición de la hora indica cada hora.

// Entonces: a los 0 minutos de cada hora → 01:00, 02:00, 03:00, ..., 23:00.