import mongoose from 'mongoose';

const playerStatSchema = new mongoose.Schema({
  uid:         { type: String, unique: true }, // ejemplo: PD-2025-44
  playerId:    Number,
  playerName:  String,
  teamName:    String,
  goals:       Number,
  assists:     Number,
  played:      Number,
  competition: String, // 'LaLiga' o 'Champions League'
  season:      Number,
}, { timestamps: true });

export default mongoose.model('PlayerStat', playerStatSchema);
