// models/Series.js
import mongoose from 'mongoose';

const episodeSchema = new mongoose.Schema({
  season: Number,
  episode: Number,
  title: String,
  overview: String,        // ✅ Descripción del episodio
  releaseDate: Date,
  duration: Number,
  stillImage: String       // ✅ Imagen del episodio
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
  platform: String,
  type: String,
  url: String
}, { _id: false });

// Nuevo esquema para idiomas de audio
const audioLanguageSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true }
}, { _id: false });

// Nuevo esquema para idiomas de subtítulos
const subtitleLanguageSchema = new mongoose.Schema({
  code: { type: String, required: true }
}, { _id: false });

const seriesSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true, unique: true },
  imdbId: String,
  title: String,
  synopsis: String,
  image: String,
  backdrop: String,
  genres: [String],                  // ✅ Géneros desde TMDb
  totalSeasons: Number,
  episodes: [episodeSchema],
  availability: [availabilitySchema],
  availabilityCheckedAt: Date,      // ✅ Última consulta en Watchmode
  popularity: Number,
  voteAverage: Number,              // ✅ Puntuación media TMDb
  voteCount: Number,                // ✅ Número de votos
  runtimeAvg: Number,               // ✅ Duración media estimada
  status: String,                   // ✅ 'ended', 'running', 'cancelled', etc.
  topAppearances: { type: Number, default: 0 }, // ✅ Veces en el top semanal

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SeriesCategory',
    required: false                // ✅ Asignación opcional basada en género
  },

  // Nuevos campos para idiomas
  audioLanguages: [audioLanguageSchema],   // Idiomas de audio disponibles
  subtitleLanguages: [subtitleLanguageSchema], // Idiomas de subtítulos disponibles

  fetchedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Series', seriesSchema);
