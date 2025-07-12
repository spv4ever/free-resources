import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import ImagenGenerada from '../models/ImagenGenerada.js';
import { getComfyUrl } from './comfyService.js';


const esperar = (ms) => new Promise((res) => setTimeout(res, ms));

export const manejarFinalizacionDeJob = async (promptId, { nickname, prompt, userId, filename }) => {
  try {
    const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const carpetaCloudinary = `keikoprompts/${nickname}/${fecha}`;
    const comfyUrl = await getComfyUrl('flux');
    const imageUrl = `${comfyUrl}/view?filename=output/${filename}`;
    const tempFilePath = path.join(os.tmpdir(), filename);

    const auth = {
      username: process.env.COMFY_AUTH_USER,
      password: process.env.COMFY_AUTH_PASS
    };

    let intento = 1;
    let exito = false;

    while (intento <= 5 && !exito) {
      try {
        console.log(`📡 Intento ${intento}: descargando imagen desde ${imageUrl}`);

        const response = await axios.get(imageUrl, {
          responseType: 'stream',
          auth
        });

        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        exito = true; // 🟢 Imagen descargada correctamente
      } catch (err) {
        console.warn(`⚠️ Fallo intento ${intento}: ${err.message}`);
        intento++;
        await esperar(2000);
      }
    }

    if (!exito) {
      throw new Error(`No se pudo descargar la imagen tras ${intento - 1} intentos`);
    }

    // 🔍 Calcular public_id sin extensión
    const nombreSinExtension = filename.replace(/\.[^/.]+$/, ''); // "KeikoDev_00122_"
    const public_id = `${carpetaCloudinary}/${nombreSinExtension}`; // completo para Cloudinary

    // ☁️ Subir a Cloudinary
    const result = await cloudinary.uploader.upload(tempFilePath, {
      public_id,
      width: 800,
      crop: 'limit',
      quality: 'auto',
      overwrite: true,
      resource_type: 'image'
    });

    // 🧹 Eliminar archivo temporal
    if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      } else {
        console.warn('⚠️ Archivo temporal no encontrado para eliminar:', tempFilePath);
      }

    // 🧠 Guardar en Mongo
    await ImagenGenerada.findOneAndUpdate(
      { prompt_id: promptId },
      {
        filename: result.public_id,         // ← ahora sí sirve para eliminar luego
        url: result.secure_url,             // URL temporal si la usas
        finalUrl: result.secure_url,        // URL de Cloudinary
        status: 'completada'
      }
    );

    console.log(`✅ Imagen subida a Cloudinary y MongoDB actualizada (${promptId})`);
  } catch (err) {
    console.error(`❌ Error en manejarFinalizacionDeJob (${promptId}):`, err);
  }
};
