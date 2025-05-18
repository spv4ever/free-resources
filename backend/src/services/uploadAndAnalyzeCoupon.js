import cloudinary from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
import IgraalCoupon from '../models/IgraalCoupon.js';
import { analyzeCouponImage } from './aiVision.js'; // IA OpenAI Vision u OCR

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const processCouponImage = async (filePath) => {
  try {
    // 1. Subir imagen
    const result = await cloudinary.v2.uploader.upload(filePath, {
      folder: 'cupones_igraal',
      width: 800,
      crop: 'limit',
      quality: 'auto',
      overwrite: true,
      resource_type: 'image'
    });

    // 2. Eliminar temporal
    fs.unlinkSync(filePath);

    // 3. Analizar con IA
    const parsedCoupons = await analyzeCouponImage(result.secure_url);

    // 🧪 LOG para depurar
    console.log('[DEBUG] Cupones detectados por IA:', parsedCoupons);

    // 4. URL fija de afiliado
    const urlAfiliado = 'https://es.igraal.com/padrinazgo?padrino=AG_67ae2774a44af'; // 🔗 cambia esta URL

    // 5. Crear registros en MongoDB
    const createdCoupons = await Promise.all(
      parsedCoupons.map(({ title, description, code, url }) => {
        return IgraalCoupon.create({
          title,
          description,
          code,
          sourceUrl: url || null, // URL detectada por IA
          url: urlAfiliado,       // Tu URL de afiliado
          imageUrl: result.secure_url,
          status: 'pendiente'
        });
      })
    );


    return createdCoupons;
  } catch (err) {
    console.error('❌ Error procesando imagen del cupón:', err);
    throw new Error('Error al subir y analizar imagen del cupón');
  }
};
