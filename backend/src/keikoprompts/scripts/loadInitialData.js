import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { importPromptPackFile } from '../services/promptImporter.js';

dotenv.config();
const MONGODB_URI = process.env.MONGO_URI;

// Resolver rutas en entorno ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, '../../data/keikoprompts_todos_los_packs (1).json');

const runImport = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Conectado a MongoDB');

    const raw = fs.readFileSync(jsonPath, 'utf8');
    const original = JSON.parse(raw);

    if (!Array.isArray(original)) {
      throw new Error('❌ El JSON debe ser un array de prompts con metadata de pack');
    }

    console.log('📄 Primer prompt:', original[0]);
    console.log('🔎 Total de prompts en JSON:', original.length);

    const result = await importPromptPackFile(original);
    console.log('✅ Importación completada:', result);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error al importar:', err);
    process.exit(1);
  }
};

runImport();
