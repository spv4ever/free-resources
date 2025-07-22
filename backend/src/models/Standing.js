// models/Standing.js
import mongoose from 'mongoose';

const standingSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  competition: { type: String, enum: ['LaLiga', 'Champions'], required: true },
  season: { type: String, required: true },
  position: Number,
  played: Number,
  won: Number,
  draw: Number,
  lost: Number,
  goalsFor: Number,
  goalsAgainst: Number,
  goalDifference: Number,
  points: Number
}, { timestamps: true });

export default mongoose.model('Standing', standingSchema);
