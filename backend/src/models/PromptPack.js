// models/PromptPack.js
import mongoose from 'mongoose';

const promptPackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  version: { type: String, default: '1.0' },
  category: String,
  platform: String, // ChatGPT, PixAI, Leonardo, etc.
  nsfw: { type: Boolean, default: false },
  access: { type: String, enum: ['free', 'pro'], default: 'free' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

promptPackSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('PromptPack', promptPackSchema);
