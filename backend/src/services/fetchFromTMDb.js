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
  // 1) Info principal con idiomas de audio
  const { data: info } = await axios.get(
    `${TMDB_BASE_URL}/tv/${tmdbId}`,
    { params: { api_key: TMDB_API_KEY, language: 'es-ES' } }
  );

  // Asegurarnos de que siempre sea array
  const audioLanguages = Array.isArray(info.spoken_languages)
    ? info.spoken_languages.map(lang => ({
        code: lang.iso_639_1,
        name: lang.name
      }))
    : [];

  // 2) IDs externos
  const { data: externalIds } = await axios.get(
    `${TMDB_BASE_URL}/tv/${tmdbId}/external_ids`,
    { params: { api_key: TMDB_API_KEY } }
  );

  // 3) Traducciones (posibles subtítulos)
  const { data: translationsRes } = await axios.get(
    `${TMDB_BASE_URL}/tv/${tmdbId}/translations`,
    { params: { api_key: TMDB_API_KEY } }
  );
  const subtitleLanguages = Array.isArray(translationsRes.translations)
    ? translationsRes.translations.map(t => ({ code: t.iso_639_1 }))
    : [];

  // 4) Episodios y cálculo de duración media (igual que antes)…
  const episodes = [];
  const allDurations = [];
  for (let seasonNum = 1; seasonNum <= info.number_of_seasons; seasonNum++) {
    try {
      const { data: season } = await axios.get(
        `${TMDB_BASE_URL}/tv/${tmdbId}/season/${seasonNum}`,
        { params: { api_key: TMDB_API_KEY, language: 'es-ES' } }
      );
      season.episodes.forEach(ep => {
        if (ep.runtime) allDurations.push(ep.runtime);
        episodes.push({
          season: seasonNum,
          episode: ep.episode_number,
          title: ep.name,
          overview: ep.overview || '',
          releaseDate: ep.air_date ? new Date(ep.air_date) : null,
          duration: ep.runtime || null,
          stillImage: ep.still_path
            ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
            : null
        });
      });
    } catch (err) {
      console.warn(`⚠️ Temporada ${seasonNum} no encontrada:`, err.message);
    }
  }
  const runtimeAvg = allDurations.length
    ? Math.round(allDurations.reduce((a, b) => a + b, 0) / allDurations.length)
    : null;

  return {
    tmdbId: info.id,
    imdbId: externalIds.imdb_id || null,
    title: info.name,
    synopsis: info.overview,
    image: info.poster_path
      ? `https://image.tmdb.org/t/p/w500${info.poster_path}`
      : null,
    backdrop: info.backdrop_path
      ? `https://image.tmdb.org/t/p/w780${info.backdrop_path}`
      : null,
    genres: info.genres.map(g => g.name),
    totalSeasons: info.number_of_seasons,
    episodes,
    popularity: info.popularity,
    voteAverage: info.vote_average || null,
    voteCount: info.vote_count || null,
    runtimeAvg,
    status: info.status?.toLowerCase() || null,
    audioLanguages,       // ← array garantizado
    subtitleLanguages     // ← array garantizado
  };
};

