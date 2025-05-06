import mongoose from 'mongoose';

const trainingResourceSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String
  },
  categoria: {
    type: String, // Ej: "Programación", "IA", "Diseño"
    required: true
  },
  tipo: {
    type: String, // Ej: "curso", "video", "pdf", "artículo"
    required: true
  },
  plataforma: {
    type: String // Ej: "YouTube", "Coursera", "edX", "OpenClassrooms"
  },
  url: {
    type: String,
    required: true
  },
  duracion: {
    type: String // Ej: "2h", "4 semanas", "Libre"
  },
  dificultad: {
    type: String // Ej: "Principiante", "Intermedio", "Avanzado"
  },
  idioma: {
    type: String // Ej: "Español", "Inglés"
  },
  certificado: {
    type: Boolean,
    default: false
  },
  gratuito: {
    type: Boolean,
    default: true
  },
  precio: {
    type: String, // Ej: "29.99", "Gratis", "USD 15"
    default: 'Gratis'
  },  
  destacado: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('TrainingResource', trainingResourceSchema);
