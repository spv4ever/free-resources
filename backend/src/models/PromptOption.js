// models/PromptOption.js
import mongoose from 'mongoose';

const promptOptionSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'PromptOptionGroup', required: true },
  name: { type: String, required: true }, // identificador interno, ej: "realista"
  label: { type: String, required: true }, // visible en frontend, ej: "Estilo realista"
  description: String,
  isNsfw: { type: Boolean, default: false }, // si la opción es válida solo para prompts NSFW
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('PromptOption', promptOptionSchema);
