import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// 👇 NO USAMOS NINGÚN IMPORT EXTERNO
import ViewAngle from '../models/ViewAngle.js'; // Cambia la ruta según tu estructura de carpetas

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Conectado');

  const testData = [
    { angle: 'from below' },
    { angle: 'side view' },
    { angle: 'overhead' }
  ];

  await ViewAngle.deleteMany();
  await ViewAngle.insertMany(testData);

  console.log('🎉 Insertado correctamente sin errores');
  process.exit();
};

run().catch(err => {
  console.error('❌ Error crítico:', err);
  process.exit(1);
});
