import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// 🔍 Buscar series por texto
export const searchSeriesInTMDb = async (query) => {
  const { data } = await axios.get(`${TMDB_BASE_URL}/search/tv`, {
    params: {
      api_key: TMDB_API_KEY,
      query,
      language: 'es-ES'
    }
  });

  return data.results.map(s => ({
    tmdbId: s.id,
    title: s.name,
    image: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : null,
    year: s.first_air_date ? s.first_air_date.split('-')[0] : null,
    popularity: s.popularity
  }));
};

// 📦 Obtener los detalles completos de una serie
export const getSeriesDetailsFromTMDb = async (tmdbId) => {
  const { data: info } = await axios.get(`${TMDB_BASE_URL}/tv/${tmdbId}`, {
    params: {
      api_key: TMDB_API_KEY,
      language: 'es-ES'
    }
  });

  const { data: externalIds } = await axios.get(`${TMDB_BASE_URL}/tv/${tmdbId}/external_ids`, {
    params: { api_key: TMDB_API_KEY }
  });

  const episodes = [];
  const allDurations = [];

  for (let s = 1; s <= info.number_of_seasons; s++) {
    try {
      const { data: season } = await axios.get(`${TMDB_BASE_URL}/tv/${tmdbId}/season/${s}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'es-ES'
        }
      });

      season.episodes.forEach(ep => {
        if (ep.runtime) allDurations.push(ep.runtime);

        episodes.push({
          season: s,
          episode: ep.episode_number,
          title: ep.name,
          releaseDate: ep.air_date ? new Date(ep.air_date) : null,
          duration: ep.runtime || null
        });
      });
    } catch (err) {
      console.warn(`⚠️ Temporada ${s} no encontrada`);
    }
  }

  // Calcular duración promedio
  const runtimeAvg = allDurations.length
    ? Math.round(allDurations.reduce((a, b) => a + b, 0) / allDurations.length)
    : null;

  return {
    tmdbId: info.id,
    imdbId: externalIds.imdb_id || null,
    title: info.name,
    synopsis: info.overview,
    image: info.poster_path ? `https://image.tmdb.org/t/p/w500${info.poster_path}` : null,
    backdrop: info.backdrop_path ? `https://image.tmdb.org/t/p/w780${info.backdrop_path}` : null,
    genres: info.genres.map(g => g.name),
    totalSeasons: info.number_of_seasons,
    episodes,
    popularity: info.popularity,
    voteAverage: info.vote_average || null,
    voteCount: info.vote_count || null,
    runtimeAvg,
    status: info.status ? info.status.toLowerCase() : null // "Ended" → "ended"
  };
};

