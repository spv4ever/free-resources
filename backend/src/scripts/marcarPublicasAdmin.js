// src/scripts/marcarPublicasAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ImagenGenerada from '../models/ImagenGenerada.js';
import User from '../models/User.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const admin = await User.findOne({ role: 'admin' });
if (!admin) {
  console.log('❌ No se encontró el usuario admin');
  process.exit(1);
}

const resultado = await ImagenGenerada.updateMany(
  { user: admin._id, status: 'completada', finalUrl: { $exists: true, $ne: '' } },
  { $set: { public: true } }
);

console.log(`✅ Imágenes actualizadas: ${resultado.modifiedCount}`);
process.exit();
