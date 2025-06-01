import mongoose from 'mongoose';

const youtubeTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String
  },
  access_token: {
    type: String,
    required: true,
  },
  refresh_token: {
    type: String,
    required: true,
  },
  scope: String,
  token_type: String,
  expiry_date: {
    type: Date,
    required: true,
  },
  channelId: {
    type: String,
    required: true,
    unique: true
  },
  channelTitle: String,
}, {
  timestamps: true
});

const YoutubeToken = mongoose.model('YoutubeToken', youtubeTokenSchema);
export default YoutubeToken;
