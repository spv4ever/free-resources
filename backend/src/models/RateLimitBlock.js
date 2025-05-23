import mongoose from 'mongoose';

const rateLimitBlockSchema = new mongoose.Schema({
  ip: String,
  path: String,
  timestamp: { type: Date, default: Date.now },
  reason: { type: String, default: 'Too many requests' }
});

const RateLimitBlock = mongoose.model('RateLimitBlock', rateLimitBlockSchema);
export default RateLimitBlock;
