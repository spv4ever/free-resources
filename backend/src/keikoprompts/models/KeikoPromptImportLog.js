import mongoose from 'mongoose';

const promptImportLogSchema = new mongoose.Schema({
  filename: String,
  importedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  importedAt: { type: Date, default: Date.now },
  totalPrompts: Number,
  totalPacks: Number,
  notes: String
});

export default mongoose.models.KeikoPromptImportLog || mongoose.model('KeikoPromptImportLog', promptImportLogSchema);
