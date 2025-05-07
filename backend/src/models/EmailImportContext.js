import mongoose from 'mongoose';

const EmailImportContextSchema = new mongoose.Schema({
  context: { type: String, unique: true },
  searchTerm: String,
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'manual'],
    default: 'daily'
  },
  active: { type: Boolean, default: true },
  lastImportedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('EmailImportContext', EmailImportContextSchema);
