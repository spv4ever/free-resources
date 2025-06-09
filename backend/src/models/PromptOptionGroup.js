// models/PromptOptionGroup.js
import mongoose from 'mongoose';

const promptOptionGroupSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Ej: "estilo", "ángulo", "ropa"
  label: { type: String, required: true }, // Nombre visible en frontend: "Estilo", "Ángulo", etc.
  multiple: { type: Boolean, default: true }, // si se pueden seleccionar varias a la vez
  description: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('PromptOptionGroup', promptOptionGroupSchema);
