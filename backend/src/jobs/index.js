import cron from 'node-cron';
import { syncTopSeries } from './syncTopSeries.js';


// Ejecutar todos los días a la 01:00 AM
cron.schedule('0 1 * * *', async () => {
  console.log('[CRON] Ejecutando syncTopSeries...');
  await syncTopSeries();
});
