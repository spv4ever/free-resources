import axios from 'axios';
import Series from '../models/Series.js';
import WeeklyTopSeries from '../models/WeeklyTopSeries.js';
import { getSeriesDetailsFromTMDb } from './fetchFromTMDb.js';
import { getAvailabilityFromWatchmode } from './fetchFromWatchmode.js';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const getCurrentMonday = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const syncWeeklyTop = async () => {
  try {
    const { data } = await axios.get('https://api.themoviedb.org/3/trending/tv/week', {
      params: {
        api_key: TMDB_API_KEY,
        language: 'es-ES'
      }
    });

    const topList = data.results.slice(0, 20);
    const ranking = [];

    for (let i = 0; i < topList.length; i++) {
      const tmdbId = topList[i].id;
      let series = await Series.findOne({ tmdbId });

      if (!series) {
        const details = await getSeriesDetailsFromTMDb(tmdbId);
        if (details.imdbId) {
          details.availability = await getAvailabilityFromWatchmode(details.imdbId);
          details.availabilityCheckedAt = new Date();
        }
        series = await Series.create(details);
      }

      ranking.push({ seriesId: series._id, rank: i + 1 });
    }

    const monday = getCurrentMonday();

    await WeeklyTopSeries.findOneAndUpdate(
      { week: monday },
      { seriesRankings: ranking },
      { upsert: true }
    );

    for (const entry of ranking) {
      await Series.findByIdAndUpdate(entry.seriesId, { $inc: { topAppearances: 1 } });
    }

    console.log(`[SYNC] Top semanal guardado para el lunes ${monday.toISOString().split('T')[0]}`);
  } catch (err) {
    console.error('[SYNC] Error al sincronizar ranking semanal:', err.message);
  }
};

export default syncWeeklyTop;
