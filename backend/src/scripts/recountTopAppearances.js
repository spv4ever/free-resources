import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Series from '../models/Series.js';
import WeeklyTopSeries from '../models/WeeklyTopSeries.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Reiniciar todos los contadores
    await Series.updateMany({}, { topAppearances: 0 });

    // Obtener todos los rankings semanales
    const allRankings = await WeeklyTopSeries.find();

    const appearancesMap = new Map();

    for (const ranking of allRankings) {
      for (const { seriesId } of ranking.seriesRankings) {
        const key = seriesId.toString();
        appearancesMap.set(key, (appearancesMap.get(key) || 0) + 1);
      }
    }

    // Aplicar los nuevos contadores
    for (const [seriesId, count] of appearancesMap.entries()) {
      await Series.findByIdAndUpdate(seriesId, { topAppearances: count });
    }

    console.log(`✅ Actualizado topAppearances en ${appearancesMap.size} series`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al recalcular topAppearances:', err.message);
    process.exit(1);
  }
};

run();
