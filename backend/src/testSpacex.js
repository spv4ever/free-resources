import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { updateSpacexLaunches } from './controllers/spacexController.js';

dotenv.config(); // Carga tu .env

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Conectado a MongoDB');
    await updateSpacexLaunches();
    console.log('Lanzamientos actualizados');
    mongoose.disconnect();
  })
  .catch(err => console.error('Error conectando:', err));
