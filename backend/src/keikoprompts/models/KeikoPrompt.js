import mongoose from 'mongoose';

const promptSchema = new mongoose.Schema({
  packId: { type: mongoose.Schema.Types.ObjectId, ref: 'KeikoPromptPack', required: true },
  number: Number,
  scene: String,
  prompt: String,
  nsfw: { type: Boolean, default: false },
  platform: { type: String, required: true },
  access: { type: String, enum: ['free', 'pro'], default: 'free' },
  fixedOptions: { type: Map, of: [Object] }
}, {
  timestamps: true
});

export default mongoose.models.KeikoPrompt || mongoose.model('KeikoPrompt', promptSchema);
