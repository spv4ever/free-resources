import mongoose from 'mongoose';

const promptOptionGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  multiple: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.KeikoPromptOptionGroup || mongoose.model('KeikoPromptOptionGroup', promptOptionGroupSchema);
