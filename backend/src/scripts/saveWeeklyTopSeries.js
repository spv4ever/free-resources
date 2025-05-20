import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import syncWeeklyTop from '../services/syncWeeklyTop.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    await syncWeeklyTop();

    console.log('✅ Sincronización manual completa');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al ejecutar sincronización manual:', err.message);
    process.exit(1);
  }
};

run();
