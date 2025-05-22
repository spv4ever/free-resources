import mongoose from 'mongoose';

const suspiciousAccessSchema = new mongoose.Schema({
  ip: String,
  method: String,
  path: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});

const SuspiciousAccess = mongoose.model('SuspiciousAccess', suspiciousAccessSchema);
export default SuspiciousAccess;
