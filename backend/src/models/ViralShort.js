import mongoose from 'mongoose';

const viralShortSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoId: { type: String, required: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ShortCategory', required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  publishedAt: { type: Date },
  thumbnail: { type: String },
  channelTitle: { type: String },
}, {
  timestamps: true
});

const ViralShort = mongoose.model('ViralShort', viralShortSchema);
export default ViralShort;
