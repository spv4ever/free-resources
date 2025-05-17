import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  value: { type: String, required: true },    // Ej: 'nsfw', 'wet skin'
  category: String                            // Ej: 'safety', 'effect', etc.
});

export default mongoose.models.Tag || mongoose.model('Tag', tagSchema);
