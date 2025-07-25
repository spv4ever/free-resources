import mongoose from 'mongoose';

const cpxRecompensaSchema = new mongoose.Schema({
  trans_id: { type: String, required: true, unique: true },
  user_id: String,
  amount_usd: Number,
  creditos_dados: Number,
  status: Number, // 1 = válido, 2 = revertido
  createdAt: { type: Date, default: Date.now }
});

const CpxRecompensa = mongoose.model('CpxRecompensa', cpxRecompensaSchema);
export default CpxRecompensa;
