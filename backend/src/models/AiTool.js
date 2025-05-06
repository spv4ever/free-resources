import mongoose from 'mongoose';

const aiToolSchema = new mongoose.Schema(
  {
    herramientaAI: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      enum: ['texto', 'imagenes', 'audio', 'video', 'chatbot', 'productividad', 'educacion', 'programacion', 'traduccion', 'investigacion', 'marketing', 'diseno', 'gestion', 'finanzas', 'otros'],
      required: true
    },
    planGratuito: {
      type: Boolean,
      default: false,
    },
    estrellas: {
      type: Number,
      min: 1,
      max: 5,
    },
    icon: {
      type: String,
      default: '',
    },
    url_formacion: {
      type: String,
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

const AiTool = mongoose.model('AiTool', aiToolSchema);
export default AiTool;
