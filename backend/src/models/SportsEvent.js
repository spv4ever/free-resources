// models/SportsEvent.js
import mongoose from 'mongoose';

const sportsEventSchema = new mongoose.Schema({
  uid:         { type: String, unique: true },
  title:       String,
  description: String,
  location:    String,
  start:       Date,
  end:         Date,

  // Para escalabilidad:
  sport:       { type: String }, // ej. 'motogp', 'f1', 'futbol'
  competition: { type: String }, // ej. 'MotoGP World Championship', 'LaLiga', etc.
  category:    String,           // ej. 'MotoGP', 'Moto2', 'Primera División'
  sessionType: String,           // ej. 'Race', 'Sprint', 'Entrenamiento', 'Partido'

  eventSlug:   String,           // ej. 'gp-catalunya-2025', 'madrid-vs-barcelona-2025'

  metadata:    { type: mongoose.Schema.Types.Mixed }, // datos extra (opcional)
}, { timestamps: true });

export default mongoose.model('SportsEvent', sportsEventSchema);
