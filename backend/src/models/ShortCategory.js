// models/ShortCategory.js
import mongoose from 'mongoose';

const shortCategorySchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    default: ''
  },
  activa: {
    type: Boolean,
    default: true
  },
  keywords: {
    type: String,
    required: true,
    trim: true
  },
  subcategoria: {
    type: String,
    enum: ['Humor', 'Tutorial', 'Review', 'Otro'],
    default: 'Otro'
  }
}, { timestamps: true });

export default mongoose.model('ShortCategory', shortCategorySchema);