import mongoose from 'mongoose';

const comfyConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // ejemplo: "flux"
  url: { type: String, required: true } // <- almacenada como texto encriptado
});

export default mongoose.model('ComfyConfig', comfyConfigSchema);
