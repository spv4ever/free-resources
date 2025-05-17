import mongoose from 'mongoose';

const viewAngleSchema = new mongoose.Schema({
  view: { type: String, required: true }     // Ej: 'from below', 'side view'
});

export default mongoose.models.ViewAngle || mongoose.model('ViewAngle', viewAngleSchema);
