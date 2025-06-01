// models/youtubeUploadLogModel.js
import mongoose from 'mongoose';

const youtubeUploadLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadDate: { type: Date, default: Date.now }, // se truncará por día
  videoId: { type: String },
  channelId: { type: String }
}, { timestamps: true });

youtubeUploadLogSchema.index({ userId: 1, uploadDate: 1 });

export default mongoose.model('YoutubeUploadLog', youtubeUploadLogSchema);
