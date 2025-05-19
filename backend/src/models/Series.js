import mongoose from 'mongoose';

const episodeSchema = new mongoose.Schema({
  season: Number,
  episode: Number,
  title: String,
  duration: Number,
  releaseDate: Date
}, { _id: false });

const seriesSchema = new mongoose.Schema({
  title: String,
  externalId: String,        // ID de Watchmode
  imdbId: String,            // ✅ ID de IMDb
  year: Number,
  synopsis: String,
  image: String,
  platform: String,          // Plataforma principal (opcional)
  genres: [String],
  totalSeasons: Number,
  episodes: [episodeSchema],
  fetchedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Series', seriesSchema);
