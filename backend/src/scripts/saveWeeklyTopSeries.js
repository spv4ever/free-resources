import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

import Series from '../models/Series.js';
import WeeklyTopSeries from '../models/WeeklyTopSeries.js';
import { getSeriesDetailsFromTMDb } from '../services/fetchFromTMDb.js';
import { getAvailabilityFromWatchmode } from '../services/fetchFromWatchmode.js';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_URL = 'https://api.themoviedb.org/3/trending/tv/week?language=es-ES';

const getCurrentMonday = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // lunes
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    const { data } = await axios.get(TMDB_URL, {
      params: {
        api_key: TMDB_API_KEY
      }
    });

    const topList = data.results.slice(0, 20); // top 20 series

    const ranking = [];

    for (let i = 0; i < topList.length; i++) {
      const item = topList[i];
      const tmdbId = item.id;

      let series = await Series.findOne({ tmdbId });

      if (!series) {
        console.log(`⬇️ Importando serie ${item.name} (${tmdbId})`);
        const details = await getSeriesDetailsFromTMDb(tmdbId);

        if (details.imdbId) {
          details.availability = await getAvailabilityFromWatchmode(details.imdbId);
          details.availabilityCheckedAt = new Date();
        }

        series = await Series.create(details);
      }

      ranking.push({
        seriesId: series._id,
        rank: i + 1
      });
    }

    const monday = getCurrentMonday();

    await WeeklyTopSeries.findOneAndUpdate(
      { week: monday },
      { seriesRankings: ranking },
      { upsert: true }
    );
    // Actualizar el campo topAppearances de cada serie
    for (const entry of ranking) {
    await Series.findByIdAndUpdate(entry.seriesId, {
        $inc: { topAppearances: 1 }
    });
    }

    console.log(`✅ Ranking semanal guardado para la semana que empieza el ${monday.toISOString().split('T')[0]}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error guardando ranking semanal:', err.message);
    process.exit(1);
  }
};

run();
