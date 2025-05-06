import mongoose from 'mongoose';

const youtubeChannelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    channelId: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
    description: String,
    thumbnail: String,
  }, {
    timestamps: true // 👈 esto añade createdAt y updatedAt automáticamente
  });

  export default mongoose.model('YoutubeChannel', youtubeChannelSchema);