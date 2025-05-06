import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AiTool from './src/models/AiTool.js';
import fs from 'fs';

dotenv.config();

// Leer archivo JSON
const rawData = fs.readFileSync('./iatools.json', 'utf-8');
const json = JSON.parse(rawData);

// Extraer los registros desde el bloque de tabla
const data = json.find((e) => e.type === 'table' && e.name === 'iatools').data;

// Normalizar y transformar campos
const tools = data.map((item) => ({
  herramientaAI: item.herramientaAI,
  descripcion: item.descripcion,
  url: item.url,
  tipo: item.tipo,
  planGratuito: item.planGratuito === '1',
  estrellas: parseInt(item.estrellas, 10),
  icon: item.icon,
  url_formacion: item.url_formacion || ''
}));

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await AiTool.deleteMany();
    await AiTool.insertMany(tools);
    console.log('✅ Herramientas AI importadas correctamente');
    process.exit();
  } catch (error) {
    console.error('❌ Error al importar:', error);
    process.exit(1);
  }
};

importData();
