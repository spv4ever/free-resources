import mongoose from 'mongoose';

const EmailEntrySchema = new mongoose.Schema({
  messageId: { type: String, unique: true },
  subject: String,
  date: Date,
  snippet: String,
  html: String,
  context: String,
  reviewed: { type: Boolean, default: false },
  approvedForPost: { type: Boolean, default: false },
  postCreated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('EmailEntry', EmailEntrySchema);
