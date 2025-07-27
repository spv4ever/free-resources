import mongoose from 'mongoose';

const trackingClickSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  clicks: { type: Number, default: 0 }
});

export default mongoose.model('TrackingClick', trackingClickSchema);
