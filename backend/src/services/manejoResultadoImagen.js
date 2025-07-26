import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';
import sharp from 'sharp';
import { PassThrough } from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import ImagenGenerada from '../models/ImagenGenerada.js';
import { getComfyUrl } from './comfyService.js';
import { uploadImageBufferToImageKit } from './imagekit.js';

const esperar = (ms) => new Promise((res) => setTimeout(res, ms));

export const manejarFinalizacionDeJob = async (promptId, { nickname, prompt, userId, filename }) => {
  try {
    const fecha = new Date().toISOString().split('T')[0];
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

        exito = true;
      } catch (err) {
        console.warn(`⚠️ Fallo intento ${intento}: ${err.message}`);
        intento++;
        await esperar(2000);
      }
    }

    if (!exito) throw new Error(`No se pudo descargar la imagen tras ${intento - 1} intentos`);

    const stats = fs.statSync(tempFilePath);
    let finalUrl;
    let finalFilename = filename;

    if (stats.size > 10 * 1024 * 1024) {
      console.log('📦 Imagen >10MB: convirtiendo a JPG (calidad 90)...');
      const bufferOriginal = fs.readFileSync(tempFilePath);
      const jpgBuffer = await sharp(bufferOriginal).jpeg({ quality: 90 }).toBuffer();
      finalFilename = filename.replace(/\.[^/.]+$/, '.jpg');

      if (jpgBuffer.length <= 10 * 1024 * 1024) {
        console.log('☁️ JPG resultante ≤10MB → Subiendo a Cloudinary...');
        const nombreSinExtension = finalFilename.replace(/\.[^/.]+$/, '');
        const public_id = `${carpetaCloudinary}/${nombreSinExtension}`;
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream({
            public_id,
            resource_type: 'image',
            overwrite: true
          }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          });

          const stream = new PassThrough();
          stream.end(jpgBuffer);
          stream.pipe(uploadStream);
        });

        finalUrl = result.secure_url;
      } else {
        console.log('🚀 JPG sigue >10MB → Subiendo a ImageKit...');
        const result = await uploadImageBufferToImageKit(jpgBuffer, finalFilename);
        finalUrl = result.url;
      }
    } else {
      console.log('☁️ Imagen original ≤10MB → Subiendo a Cloudinary...');
      const nombreSinExtension = filename.replace(/\.[^/.]+$/, '');
      const public_id = `${carpetaCloudinary}/${nombreSinExtension}`;
      const result = await cloudinary.uploader.upload(tempFilePath, {
        public_id,
        width: 800,
        crop: 'limit',
        quality: 'auto',
        overwrite: true,
        resource_type: 'image'
      });
      finalUrl = result.secure_url;
    }

    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    } else {
      console.warn('⚠️ Archivo temporal no encontrado para eliminar:', tempFilePath);
    }

    await ImagenGenerada.findOneAndUpdate(
      { prompt_id: promptId },
      {
        filename: finalFilename,
        url: imageUrl,
        finalUrl,
        status: 'completada'
      }
    );

    console.log(`✅ Imagen subida y MongoDB actualizada (${promptId})`);
  } catch (err) {
    console.error(`❌ Error en manejarFinalizacionDeJob (${promptId}):`, err);
  }
};
