import mongoose from 'mongoose';

const imagenGeneradaSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt_id: { type: String, required: true },
  prompt: { type: String, required: true },
  promptRef: { type: mongoose.Schema.Types.ObjectId, ref: 'KeikoPrompt' }, // nuevo
  filename: { type: String }, // se rellena al consultar /imagen/:id
  url: { type: String },      // se rellena al consultar /imagen/:id
  finalUrl: { type: String },         // ✅ URL definitiva tras subida a Cloudinary
  status: { type: String, enum: ['pendiente', 'completada'], default: 'pendiente' },
  createdAt: { type: Date, default: Date.now },
  public: { type: Boolean, default: false },      // 🆕 ¿es pública?
  visible: { type: Boolean, default: true } 
});

export default mongoose.model('ImagenGenerada', imagenGeneradaSchema);
