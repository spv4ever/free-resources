
import cron from 'node-cron';
import { updateSpacexLaunches } from '../controllers/spacexController.js';

cron.schedule('0 */4 * * *', async () => {
  console.log('[CRON] Actualizando lanzamientos de SpaceX...');
  try {
    await updateSpacexLaunches();
    console.log('[CRON] Actualización completada.');
  } catch (err) {
    console.error('[CRON] Error actualizando lanzamientos:', err.message);
  }
});
