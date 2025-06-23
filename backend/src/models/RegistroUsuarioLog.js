// src/models/RegistroUsuarioLog.js
import mongoose from 'mongoose';

const registroUsuarioLogSchema = new mongoose.Schema({
  email: String,
  nickname: String,
  success: Boolean,
  reason: String,
  details: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('RegistroUsuarioLog', registroUsuarioLogSchema);
