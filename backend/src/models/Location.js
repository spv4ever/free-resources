import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  place: { type: String, required: true }     // Ej: 'Luxury Pool', 'Neo-Tokyo Rooftop'
});

export default mongoose.models.Location || mongoose.model('Location', locationSchema);
