import mongoose from 'mongoose';

const outfitSchema = new mongoose.Schema({
  description: { type: String, required: true },  // Ej: 'black lace lingerie...'
  style: String                                   // Ej: 'sexy', 'sci-fi', etc.
});

export default mongoose.models.Outfit || mongoose.model('Outfit', outfitSchema);
