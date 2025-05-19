// models/TopSeriesHistory.js
import mongoose from 'mongoose';

const rankingSchema = new mongoose.Schema({
  seriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Series' },
  rank: Number
}, { _id: false });

const topSeriesHistorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: { type: String, required: true },
  seriesRankings: [rankingSchema]
});

topSeriesHistorySchema.index({ date: 1, type: 1 }, { unique: true });

export default mongoose.model('TopSeriesHistory', topSeriesHistorySchema);
