import mongoose from 'mongoose';

const promptOptionSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'KeikoPromptOptionGroup', required: true },
  name: { type: String, required: true },
  label: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.models.KeikoPromptOption || mongoose.model('KeikoPromptOption', promptOptionSchema);
