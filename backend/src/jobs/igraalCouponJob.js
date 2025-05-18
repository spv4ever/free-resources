import cron from 'node-cron';
import { fetchIgraalCoupons } from '../scripts/fetchIgraalCoupons.js';

cron.schedule('0 4,16 * * *', async () => {
//cron.schedule('* * * * *', async () => {
  console.log('[CRON] ⏳ Actualizando cupones iGraal...');
  try {
    await fetchIgraalCoupons();
    console.log('[CRON] ✅ Cupones iGraal actualizados');
  } catch (err) {
    console.error('❌ Error actualizando cupones iGraal:', err.message);
  }
});