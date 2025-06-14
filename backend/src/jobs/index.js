import cron from 'node-cron';
import { syncTopSeries } from './syncTopSeries.js';


// Ejecutar todos los días a la 01:00 AM
cron.schedule('0 1 * * *', async () => {
  console.log('[CRON] Ejecutando syncTopSeries...');
  await syncTopSeries();
});

import { importMotoGPCalendar } from './importMotoGPCalendar.js'; // cambia si usas default

// Ejecutar los lunes a las 04:00 AM
cron.schedule('0 4 * * 1', async () => {
  console.log('[CRON] Ejecutando importMotoGPCalendar...');
  try {
    await importMotoGPCalendar();
  } catch (err) {
    console.error('[CRON] Error en importMotoGPCalendar:', err.message);
  }
});