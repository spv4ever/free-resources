import mongoose from 'mongoose';

const episodeSchema = new mongoose.Schema({
  season: Number,
  episode: Number,
  title: String,
  overview: String, // ✅ Nueva propiedad
  releaseDate: Date,
  duration: Number,
  stillImage: String // ✅ NUEVO
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
  platform: String,
  type: String,
  url: String
}, { _id: false });

const seriesSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true, unique: true },
  imdbId: String,
  title: String,
  synopsis: String,
  image: String,
  backdrop: String,
  genres: [String],
  totalSeasons: Number,
  episodes: [episodeSchema],
  availability: [availabilitySchema],
  availabilityCheckedAt: Date,  // ✅ última vez que se consultó Watchmode
  popularity: Number,
  voteAverage: Number,          // ✅ puntuación media TMDb
  voteCount: Number,            // ✅ número de votos
  runtimeAvg: Number,           // ✅ duración media estimada
  status: String,               // ✅ 'ended', 'running', 'cancelled', etc.
  topAppearances: { type: Number, default: 0 }, // ✅ veces en el top semanal
  fetchedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Series', seriesSchema);
