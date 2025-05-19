import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY;
const BASE_URL = 'https://api.watchmode.com/v1';

/**
 * Obtiene disponibilidad en plataformas en España a partir de un imdb_id
 * @param {String} imdbId - ej: 'tt4574334'
 * @returns {Promise<Array>} - plataformas disponibles
 */
export const getAvailabilityFromWatchmode = async (imdbId) => {
  try {
    // Paso 1: Buscar el ID interno de Watchmode a partir del imdb_id
    const searchRes = await axios.get(`${BASE_URL}/search/`, {
      params: {
        apiKey: WATCHMODE_API_KEY,
        search_field: 'imdb_id',
        search_value: imdbId
      }
    });

    const match = searchRes.data.title_results?.[0];
    if (!match) {
      console.warn(`⚠️ No encontrado en Watchmode: ${imdbId}`);
      return [];
    }

    // Paso 2: Obtener plataformas disponibles para ese ID
    const { data } = await axios.get(`${BASE_URL}/title/${match.id}/sources`, {
      params: { apiKey: WATCHMODE_API_KEY }
    });

    const filtered = data.filter(item =>
      item.region === 'ES' &&
      ['sub', 'rent', 'buy', 'free'].includes(item.type)
    );

    return filtered.map(source => ({
      platform: source.name,
      type: source.type,
      url: source.web_url
    }));
  } catch (err) {
    console.error(`❌ Error consultando disponibilidad de ${imdbId}:`, err.message);
    return [];
  }
};
