// models/UserPromptFavorite.js
import mongoose from 'mongoose';

const userPromptFavoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt: { type: mongoose.Schema.Types.ObjectId, ref: 'PromptItem', required: true },
  favoritedAt: { type: Date, default: Date.now }
});

// Prevenir duplicados por usuario y prompt
userPromptFavoriteSchema.index({ user: 1, prompt: 1 }, { unique: true });

export default mongoose.model('UserPromptFavorite', userPromptFavoriteSchema);
