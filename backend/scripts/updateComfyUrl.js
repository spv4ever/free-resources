import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const comfyUrl = process.argv[2];

if (!comfyUrl || !comfyUrl.startsWith('https://')) {
  console.error('❌ URL no válida proporcionada.');
  process.exit(1);
}

const ComfyConfigSchema = new mongoose.Schema({
  key: String,
  url: String
});

const ComfyConfig = mongoose.model('ComfyConfig', ComfyConfigSchema);

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const result = await ComfyConfig.findOneAndUpdate(
      { key: 'flux' },
      { url: comfyUrl },
      { upsert: true, new: true }
    );

    console.log(`✅ URL actualizada en MongoDB: ${result.url}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error actualizando en MongoDB:', err.message);
    process.exit(1);
  }
};

run();
