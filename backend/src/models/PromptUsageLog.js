// models/PromptUsageLog.js
import mongoose from 'mongoose';

const promptUsageLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt: { type: mongoose.Schema.Types.ObjectId, ref: 'PromptItem', required: true },
  pack: { type: mongoose.Schema.Types.ObjectId, ref: 'PromptPack' },
  usedAt: { type: Date, default: Date.now },
  platform: String, // Ej: ChatGPT, PixAI, etc.
  fromUI: { type: Boolean, default: true } // si fue lanzado desde la interfaz
});

export default mongoose.model('PromptUsageLog', promptUsageLogSchema);
