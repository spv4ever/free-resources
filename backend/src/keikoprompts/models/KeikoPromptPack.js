import mongoose from 'mongoose';

const promptPackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, required: true },
  image: String 
}, {
  timestamps: true
});

export default mongoose.models.KeikoPromptPack || mongoose.model('KeikoPromptPack', promptPackSchema);
