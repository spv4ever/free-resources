// models/GmailToken.js
import mongoose from 'mongoose';

const GmailTokenSchema = new mongoose.Schema({
  // Usaremos un identificador fijo para asegurarnos de que solo haya un documento de tokens.
  identifier: {
    type: String,
    required: true,
    unique: true,
    default: 'spv4ever@gmail.com', // Puedes llamarlo como quieras
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true, // El más importante, nunca expira (a menos que se revoque)
  },
  tokenExpiry: {
    type: Date,
    required: true, // La fecha y hora en que expira el accessToken
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Actualiza la fecha 'updatedAt' antes de guardar
GmailTokenSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const GmailToken = mongoose.model('GmailToken', GmailTokenSchema);

export default GmailToken;