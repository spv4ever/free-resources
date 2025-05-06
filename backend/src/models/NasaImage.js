import mongoose from 'mongoose';

const nasaImageSchema = new mongoose.Schema({
  ref: {
    type: String
  },
  fecha: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  titulo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String
  },
  hdurl: {
    type: String
  },
  copyright: {
    type: String
  },
  media_type: {
    type: String
  }
}, {
  timestamps: true
});

// Índice único en "fecha" para evitar duplicados y optimizar búsqueda por fecha
nasaImageSchema.index({ fecha: 1 }, { unique: true });

export default mongoose.model('NasaImage', nasaImageSchema);
