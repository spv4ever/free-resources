import mongoose from 'mongoose';

const affiliateClickSchema = new mongoose.Schema({
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AffiliateLink',
    required: true
  },
  page: { type: String },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userAgent: { type: String },
  ip: { type: String }
});

const AffiliateClick = mongoose.model('AffiliateClick', affiliateClickSchema);
export default AffiliateClick;
