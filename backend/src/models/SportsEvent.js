import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  home: Number,
  away: Number
}, { _id: false });

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

  // Nuevos campos explícitos para fútbol
  homeTeam:    String,
  awayTeam:    String,
  status:      String,           // SCHEDULED, FINISHED, etc.
  score: {
    fullTime:  scoreSchema,
    halfTime:  scoreSchema,
  },

  // Otros datos opcionales
  metadata:    { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.model('SportsEvent', sportsEventSchema);
