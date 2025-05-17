import mongoose from 'mongoose';

const affiliateLinkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  cta: { type: String, required: true },
  url: { type: String, required: true },
  imageUrl: { type: String, required: true },
  category: { type: String },
  location: { type: String, enum: ['popup', 'banner', 'sidebar', 'footer'], default: 'popup' },
  page: { type: String },
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

const AffiliateLink = mongoose.model('AffiliateLink', affiliateLinkSchema);
export default AffiliateLink;
