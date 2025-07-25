import mongoose from 'mongoose';

const GeneradorIASchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ciclos: { type: Number, default: 0 },
  nivel: { type: Number, default: 1 },
  upgrades: { type: [String], default: [] },
  cicloPorSegundo: { type: Number, default: 0 },
  clicMultiplier: { type: Number, default: 1 },
  imagenesGeneradas: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('GeneradorIA', GeneradorIASchema);
