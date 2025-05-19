import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY;
const BASE_URL = 'https://api.watchmode.com/v1/list-titles';

/**
 * Devuelve el top de series para una plataforma o top general
 * @param {Object} options
 * @param {String} [options.sourceId] - ID de plataforma (ej. 203 para Netflix)
 * @param {Number} [options.limit] - Máximo de resultados (default: 10)
 * @returns {Promise<Array>} - Array con datos de series
 */
export const fetchTopSeries = async ({ sourceId = null, limit = 10 } = {}) => {
  try {
    const params = {
      apiKey: WATCHMODE_API_KEY,
      types: 'tv_series',
      countries: 'ES',
      limit,
      sort_by: 'popularity_desc'
    };

    if (sourceId) params.source_ids = sourceId;

    const { data } = await axios.get(BASE_URL, { params });
    console.log('📥 Respuesta de API:', data);

    return data.titles.map(item => ({
      externalId: String(item.id),
      imdbId: item.imdb_id,
      title: item.title,
      year: item.year,
      synopsis: item.plot_overview,
      image: item.poster,
      platform: item.source_names?.[0] || null, // nombre como texto
      genres: item.genre_names || [],
      totalSeasons: item.season_count
    }));
  } catch (err) {
    console.error('❌ Error al obtener top de Watchmode:', err.message);
    return [];
  }
};
