import mongoose from 'mongoose';

const socialPostSchema = new mongoose.Schema({
  refType: {
    type: String,
    enum: ['aiTool', 'resource', 'cyberScamPost', 'launch', 'category', 'chollos'],
    required: true,
  },
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'refType', // referencia dinámica
  },
  generatedText: {
    type: String,
  },
  variant: {
    type: String,
    enum: ['profesional', 'divertido', 'hilo', 'corto', 'tecnico'],
    default: 'profesional'
  },
  status: {
    type: String,
    enum: ['pendiente', 'publicado', 'descartado'],
    default: 'pendiente'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SocialPost = mongoose.model('SocialPost', socialPostSchema);

export default SocialPost;
