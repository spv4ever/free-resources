import cron from 'node-cron';
import mongoose from 'mongoose';
import { importarPartidos, importarGoleadores } from '../controllers/eventsController.js';

export function iniciarSchedulerFutbol(MONGO_URI) {
  async function connectDB() {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
    }
  }

  // 🗓️ Lunes a las 06:00 – actualiza calendario
  cron.schedule('0 6 * * 1', async () => {
    await connectDB();
    console.log('[CRON FÚTBOL] 🗓️ Actualizando calendario semanal...');
    await importarPartidos('PD', 'LaLiga', 2025);
    await importarPartidos('CL', 'Champions League', 2025);
  });

  // 🥅 Domingo a las 23:00 – resultados y goleadores
  cron.schedule('0 23 * * 0', async () => {
    await connectDB();
    console.log('[CRON FÚTBOL] 🥅 Actualizando resultados y goleadores...');
    await importarPartidos('PD', 'LaLiga', 2025);
    await importarPartidos('CL', 'Champions League', 2025);

    await importarGoleadores(
      { body: { competitionCode: 'PD', competitionName: 'LaLiga', season: 2025 } },
      { json: () => {} }
    );

    await importarGoleadores(
      { body: { competitionCode: 'CL', competitionName: 'Champions League', season: 2025 } },
      { json: () => {} }
    );
  });
    // ✅ Mensaje al iniciar el scheduler
  console.log('✅ [CRON FÚTBOL] Tareas programadas:');
  console.log('   - 🗓️ Actualización de calendario los lunes a las 06:00');
  console.log('   - 🥅 Actualización de resultados y goleadores los domingos a las 23:00');
}
