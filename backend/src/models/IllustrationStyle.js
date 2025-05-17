import mongoose from 'mongoose';

const illustrationStyleSchema = new mongoose.Schema({
  style: { type: String, required: true },   // Ej: 'Anime Illustration'
  description: String                        // Opcional
});

export default mongoose.models.IllustrationStyle || mongoose.model('IllustrationStyle', illustrationStyleSchema);
