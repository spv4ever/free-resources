import mongoose from 'mongoose';

const EmailArticleEntrySchema = new mongoose.Schema({
  emailId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailEntry', required: true },
  title: String,
  description: String,
  url: String,
  context: String,
  reviewed: { type: Boolean, default: false },
  approvedForPost: { type: Boolean, default: false },
  postCreated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('EmailArticleEntry', EmailArticleEntrySchema);
