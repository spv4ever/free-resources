import mongoose from 'mongoose';

const linkAnalysisSchema = new mongoose.Schema({
  urlOriginal: { type: String, required: true },
  urlFinal: { type: String },
  nivel: { type: Number, required: true },
  resultado: {
    type: String,
    enum: ['seguro', 'sospechoso', 'peligroso'],
    required: true
  },
  detalles: { type: Object },
  fecha: { type: Date, default: Date.now },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  ip: { type: String },
  userAgent: { type: String },

  aiAnalysis: {
    riskLevel: {
      type: String,
      enum: ['alto', 'medio', 'bajo'],
    },
    threatType: {
      type: String
    },
    summary: {
      type: String
    },
    model: {
      type: String
    },
    createdAt: {
      type: Date
    }
  }
});

const LinkAnalysis = mongoose.model('LinkAnalysis', linkAnalysisSchema);
export default LinkAnalysis;
