import cron from 'node-cron';
import { fetchIgraalDeals } from '../scripts/fetchIgraalDeals.js';

console.log('🕑 Job de iGraal cargado');

cron.schedule('0 3 * * *', async () => {
//cron.schedule('* * * * *', async () => {
  console.log('[CRON] ⏳ Actualizando chollos iGraal...');
  try {
    await fetchIgraalDeals();
    console.log('[CRON] ✅ Chollos iGraal actualizados');
  } catch (err) {
    console.error('[CRON] ❌ Error en actualización de chollos iGraal:', err.message);
  }
});
