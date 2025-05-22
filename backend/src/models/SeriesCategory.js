// models/SeriesCategory.js
import mongoose from 'mongoose';

const seriesCategorySchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  imagen: { type: String }, // Opcional: portada de la categoría
}, {
  timestamps: true
});

export default mongoose.model('SeriesCategory', seriesCategorySchema);
