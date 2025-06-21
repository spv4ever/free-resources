import mongoose from 'mongoose';

const imagenGeneradaSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt_id: { type: String, required: true },
  prompt: { type: String, required: true },
  filename: { type: String }, // se rellena al consultar /imagen/:id
  url: { type: String },      // se rellena al consultar /imagen/:id
  finalUrl: { type: String },         // ✅ URL definitiva tras subida a Cloudinary
  status: { type: String, enum: ['pendiente', 'completada'], default: 'pendiente' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('ImagenGenerada', imagenGeneradaSchema);
