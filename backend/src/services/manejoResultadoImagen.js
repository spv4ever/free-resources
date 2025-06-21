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

    // ☁️ Subir a Cloudinary
    const result = await cloudinary.uploader.upload(tempFilePath, {
      folder: carpetaCloudinary,
      width: 800,
      crop: 'limit',
      quality: 'auto',
      overwrite: true,
      resource_type: 'image',
      use_filename: true,
      unique_filename: false
    });

    fs.unlinkSync(tempFilePath); // 🧹 borrar temporal

    await ImagenGenerada.findOneAndUpdate(
      { prompt_id: promptId },
      {
        filename,
        url: result.secure_url,
        status: 'completada',
        finalUrl: result.secure_url, // la definitiva (cloudinary)
      }
    );

    console.log(`✅ Imagen subida a Cloudinary y MongoDB actualizada (${promptId})`);
  } catch (err) {
    console.error(`❌ Error en manejarFinalizacionDeJob (${promptId}):`, err);
  }
};
