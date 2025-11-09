// models/InstagramAccount.js
import mongoose from 'mongoose';

const InstagramAccountSchema = new mongoose.Schema({
  alias: { type: String, unique: true, required: true }, // ej 'keikodevfree'
  igUserId: { type: String, required: true },
  accessToken: { type: String, required: true },         // si prefieres, encriptado
  timezone: { type: String, default: 'Europe/Madrid' },
  isEnabled: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('InstagramAccount', InstagramAccountSchema);
