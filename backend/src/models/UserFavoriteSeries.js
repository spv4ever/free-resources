import mongoose from 'mongoose';

const episodeSeenSchema = new mongoose.Schema({
  seasonNumber: Number,
  episodeNumber: Number,
}, { _id: false });

const userFavoriteSeriesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Series', required: true },
  seenEpisodes: [episodeSeenSchema],
  markedComplete: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('UserFavoriteSeries', userFavoriteSeriesSchema);
