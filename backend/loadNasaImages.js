import mongoose from 'mongoose';
import dotenv from 'dotenv';
import NasaImage from './src/models/NasaImage.js';
import fs from 'fs';

dotenv.config();

// Leer JSON
const rawData = fs.readFileSync('./nasa_imagenes.json', 'utf-8');
const json = JSON.parse(rawData);

// Extraer la tabla del JSON
const data = json.find(item => item.type === 'table' && item.name === 'nasa_imagenes')?.data;

if (!data) {
  console.error('❌ No se encontró la tabla nasa_imagenes en el JSON');
  process.exit(1);
}

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await NasaImage.deleteMany(); // opcional: limpiar antes
    await NasaImage.insertMany(data);
    console.log('✅ Imágenes de la NASA importadas correctamente');
    process.exit();
  } catch (error) {
    console.error('❌ Error al importar imágenes:', error);
    process.exit(1);
  }
};

importData();
