// models/TokenTransaction.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'generation',
      'upscale',
      'remove_bg',
      'face_fix',
      'purchase',
      'bonus',
      'ad_click',
      'admin'
    ],
    required: true
  },
  amount: {
    type: Number,
    required: true // positivo o negativo
  },
  tool: {
    type: String,
    default: 'comfyui' // comfyui, replicate, clipdrop, etc.
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('TokenTransaction', transactionSchema);
