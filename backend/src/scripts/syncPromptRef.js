
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ImagenGenerada from '../models/ImagenGenerada.js';
import KeikoPrompt from '../keikoprompts/models/KeikoPrompt.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);
console.log('✅ Conectado a MongoDB');

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const imagenesSinRef = await ImagenGenerada.find({
  $or: [
    { promptRef: { $exists: false } },
    { promptRef: null }
  ]
});

console.log(`🔍 Total imágenes a revisar: ${imagenesSinRef.length}`);

let actualizadas = 0;
let noEncontradas = [];

for (const img of imagenesSinRef) {
  let promptDoc = null;

  // Intentar por ID
  if (mongoose.Types.ObjectId.isValid(img.prompt_id)) {
    promptDoc = await KeikoPrompt.findById(img.prompt_id);
  }

  // Si no lo encuentra por ID, buscar por texto del prompt
  if (!promptDoc && img.prompt) {
    promptDoc = await KeikoPrompt.findOne({
      prompt: new RegExp(`^${escapeRegex(img.prompt.trim())}$`, 'i')
    });
  }

  if (promptDoc) {
    img.promptRef = promptDoc._id;
    await img.save();
    actualizadas++;
    console.log(`✅ Imagen ${img._id} actualizada con promptRef → ${promptDoc._id}`);
  } else {
    noEncontradas.push(img.prompt_id || img._id);
  }
}

console.log(`✅ Imágenes actualizadas: ${actualizadas}`);
console.log(`❌ No se encontraron coincidencias para: ${noEncontradas.length}`);
if (noEncontradas.length) {
  console.log('IDs no vinculados:', noEncontradas.slice(0, 20));
}

await mongoose.disconnect();
