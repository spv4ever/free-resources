import mongoose from 'mongoose';

const poseSchema = new mongoose.Schema({
  pose: { type: String, required: true }      // Ej: 'Standing', 'Floating'
});

export default mongoose.models.Pose || mongoose.model('Pose', poseSchema);
