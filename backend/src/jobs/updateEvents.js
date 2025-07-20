import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { importarPartidos } from '../controllers/eventsController.js';

const MONGO_URI = process.env.MONGO_URI;

async function main() {
  await mongoose.connect(MONGO_URI);

  const temporada = 2025;

  await importarPartidos('PD', 'LaLiga', temporada);
  await importarPartidos('CL', 'Champions League', temporada);

  console.log('Eventos actualizados');
  await mongoose.disconnect();
}

main();
