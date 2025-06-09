// models/PromptItem.js
import mongoose from 'mongoose';

const promptItemSchema = new mongoose.Schema({
  pack: { type: mongoose.Schema.Types.ObjectId, ref: 'PromptPack', required: true },
  number: Number, // número del prompt dentro del pack
  scene: String,  // descripción o nombre de la escena
  prompt: { type: String, required: true },
  fixedOptions: {
    style: [String],
    angle: [String],
    outfit: [String],
    location: [String],
    pose: [String],
    tags: [String],
    expression: [String]
  },
  nsfw: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

promptItemSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('PromptItem', promptItemSchema);
