// models/ExecutionLog.js
import mongoose from 'mongoose';

const ExecutionLogSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref:'InstagramAccount', required:true },
  type: { type: String, enum: ['post','carousel','reel'], required:true },
  source: { type: String, enum: ['jitter','weekly'], required:true }, // de dónde vino el disparo
  slotKey: { type: String, required:true }, // p.ej. "2025-11-08T21:30@Europe/Madrid"
}, { timestamps:true, collection:'execution_logs' });

ExecutionLogSchema.index({ accountId:1, type:1, slotKey:1 }, { unique:true });
export default mongoose.model('ExecutionLog', ExecutionLogSchema);
