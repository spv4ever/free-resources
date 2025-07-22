// models/Team.js
import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  apiId: { type: Number, required: true, unique: true }, // ID global de football-data
  name: { type: String, required: true },
  shortName: String,
  tla: String,
  logo: String,
  area: String
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);
