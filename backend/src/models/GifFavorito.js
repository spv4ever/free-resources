import mongoose from 'mongoose';

const GifFavoritoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gifId: { type: String, required: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const GifFavorito = mongoose.model('GifFavorito', GifFavoritoSchema);
