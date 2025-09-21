// models/ImagenGenerada.js
import mongoose from 'mongoose';

const publicationSchema = new mongoose.Schema({
  platform: { type: String, required: true }, // 'instagram'
  account:  { type: String, required: true }, // alias o ig_user_id
  postId:   { type: String },
  postedAt: { type: Date, default: Date.now }
}, { _id: false });

const imagenGeneradaSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt_id: { type: String, required: true },
  prompt: { type: String, required: true },
  promptRef: { type: mongoose.Schema.Types.ObjectId, ref: 'KeikoPrompt' },
  filename: { type: String },
  url: { type: String },
  finalUrl: { type: String }, // URL Cloudinary
  status: { type: String, enum: ['pendiente','procesando','completada','oversize','fallida','entregada_telegram'], default: 'pendiente' },
  createdAt: { type: Date, default: Date.now },
  public: { type: Boolean, default: false },
  visible: { type: Boolean, default: true },

  // 🆕 controles
  publishable: { type: Boolean, default: true },
  publications: [publicationSchema],
  cloudinaryPublicId: { type: String } // opcional si quieres taggear en Cloudinary
});

imagenGeneradaSchema.index({ publishable: 1, status: 1, visible: 1, public: 1 });

export default mongoose.model('ImagenGenerada', imagenGeneradaSchema);
