import mongoose from 'mongoose';

const rankedSeriesSchema = new mongoose.Schema({
  seriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Series' },
  rank: Number
}, { _id: false });

const weeklyTopSeriesSchema = new mongoose.Schema({
  week: { type: Date, required: true }, // lunes de la semana como referencia
  seriesRankings: [rankedSeriesSchema]
});

weeklyTopSeriesSchema.index({ week: 1 }, { unique: true });

export default mongoose.model('WeeklyTopSeries', weeklyTopSeriesSchema);
