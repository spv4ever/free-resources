import mongoose from 'mongoose';
import { franc } from 'franc';
import langs from 'langs';
import dotenv from 'dotenv';
import ViralShort from '../models/ViralShort.js';

dotenv.config(); // Lee las variables de entorno (.env)

// Conexión a MongoDB
await mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Función para detectar idioma
function detectarIdioma(texto) {
  const langCode = franc(texto); // Código ISO 639-3
  if (langCode === 'und') return { code: 'und', name: 'Desconocido' };

  const lang = langs.where('3', langCode);
  return {
    code: langCode,
    name: lang ? lang.name : langCode
  };
}

// Recorre y actualiza todos los shorts
const actualizarIdiomas = async () => {
  const shorts = await ViralShort.find();
  let contador = { detectados: 0, desconocidos: 0 };

  for (const short of shorts) {
    const { code, name } = detectarIdioma(short.title || '');

    if (code !== 'und') contador.detectados++;
    else contador.desconocidos++;

    console.log(`📝 "${short.title}" → ${name} (${code})`);

    await ViralShort.findByIdAndUpdate(short._id, {
      languageDetected: name,
      languageCode: code
    });
  }

  console.log('\n✅ Proceso finalizado.');
  console.log(`🟢 Idiomas detectados: ${contador.detectados}`);
  console.log(`⚪ Títulos desconocidos: ${contador.desconocidos}`);

  mongoose.disconnect();
};

// Ejecutar
actualizarIdiomas().catch(err => {
  console.error('❌ Error al ejecutar el script:', err);
  mongoose.disconnect();
});
