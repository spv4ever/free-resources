
import mongoose from 'mongoose';

const CyberScamPostSchema = new mongoose.Schema({
  emailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailEntry',
    required: true
  },
  resumen: {
    type: String,
    required: true,
    default: 'Resumen no disponible',
  },
  redaccion: {
    type: String,
    required: true,
    default: 'Redacción no generada',
  },
  clasificacion: {
    type: String,
    required: true,
    default: 'Desconocida',
  },
  explicacion: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: null,
  },
  titulo: {
    type: String,
    required: true,
    default: 'Título no disponible',
  },
  fuente: {
    type: String,
    default: null,
  },
  seoSummary: {
    type: String,
    default: '',
  },
  socialPost: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
  
});

export default mongoose.model('CyberScamPost', CyberScamPostSchema);
