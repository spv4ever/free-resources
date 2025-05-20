import cron from 'node-cron';
import syncWeeklyTop from '../services/syncWeeklyTop.js';

// 🕒 Ejecutar todos los lunes a las 02:00
cron.schedule('0 2 * * 1', async () => {
  console.log('[CRON] Ejecutando sincronización semanal de series...');
  await syncWeeklyTop();
});
