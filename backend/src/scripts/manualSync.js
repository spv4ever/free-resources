// scripts/manualSync.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { syncTopSeries } from '../jobs/syncTopSeries.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/topseries';

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    await syncTopSeries(); // Ejecuta la sincronización

    console.log('✅ Sincronización manual completa');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante la sincronización manual:', err.message);
    process.exit(1);
  }
};

run();
