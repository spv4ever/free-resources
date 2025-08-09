// src/models/Text2ImageJob.js
import mongoose from 'mongoose';

const text2ImageJobSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Prompt y parámetros usados
    prompt: { type: String, required: true },
    params: {
      ratio: { type: String, default: '1:1' },
      steps: { type: Number, default: 20 },
      seed: { type: Number, default: null },
      filename_prefix: { type: String, default: 'keiko' },
      modo: { type: String, enum: ['normal', 'pro', 'anime', 'wallpaper'], default: 'normal' }
    },

    // Estado del flujo
    status: { type: String, enum: ['pendiente', 'en_proceso', 'completada', 'error'], default: 'pendiente' },
    errorMsg: { type: String, default: null },

    // IDs/refs del backend de generación
    clientId: { type: String, default: null },
    queueId: { type: String, default: null },

    // Resultado
    filename: { type: String, default: null },
    url: { type: String, default: null },        // URL temporal si la usas
    finalUrl: { type: String, default: null },   // Cloudinary final

    // Tokens
    tokenCost: { type: Number, default: 1 },     // coste por generación
    tokensDebited: { type: Boolean, default: false }, // para saber si ya se descontó

  },
  { timestamps: true }
);

text2ImageJobSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Text2ImageJob', text2ImageJobSchema);
