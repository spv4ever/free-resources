// models/DownloadHistory.js
import mongoose from 'mongoose';

const downloadHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    required: true
  },
  title: String,
  url: String,
  filename: String,
  format: String,
  thumbnail: String,
  duration: Number,
  downloadedAt: {
    type: Date,
    default: Date.now
  }
});

const DownloadHistory = mongoose.model('DownloadHistory', downloadHistorySchema);
export default DownloadHistory;
