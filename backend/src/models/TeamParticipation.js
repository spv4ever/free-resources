// models/TeamParticipation.js
import mongoose from 'mongoose';

const teamParticipationSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  competition: { type: String, enum: ['LaLiga', 'Champions'], required: true },
  season: { type: String, required: true } // Ej: '2025'
}, { timestamps: true });

teamParticipationSchema.index({ team: 1, competition: 1, season: 1 }, { unique: true });

export default mongoose.model('TeamParticipation', teamParticipationSchema);
