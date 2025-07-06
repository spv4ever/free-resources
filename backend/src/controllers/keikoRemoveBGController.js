import { generarImagenRMBG } from '../services/generarImagenOptimizada.js';
import ImagenGenerada from '../models/ImagenGenerada.js';
import { getComfyUrl } from '../services/comfyService.js';
import { getComfyAuth } from '../utils/comfyAuth.js';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';

const esperar = ms => new Promise(r => setTimeout(r, ms));

export async function removeBackground(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    const originalName = req.body.filename || req.file.originalname || `image_${Date.now()}`;
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const filenameRMBG = `${baseName}_RMBG.png`;

    const inputBuffer = req.file.buffer;
    const userId = req.user._id;
    const nickname = req.user.nickname;
    
    console.log(filenameRMBG)

    // Lanza el job
    const resultado = await generarImagenRMBG({ imageBuffer: inputBuffer, filenameRMBG  });

    if (!resultado.prompt_id) {
      throw new Error('No se recibió prompt_id desde ComfyUI');
    }

    // Guarda entrada en BD (sin URL aún)
    await ImagenGenerada.create({
        user: userId,
        prompt_id: resultado.prompt_id,
        prompt: 'Remove Background',
        public: false,
        inputUrl: resultado.inputUrl,
        filename: filenameRMBG,
        });

    const comfyUrl = await getComfyUrl('flux');
    const filename = await esperarHastaObtenerImagen(resultado.prompt_id, comfyUrl);

    // Descarga la imagen generada desde ComfyUI
    const auth = {
      username: process.env.COMFY_AUTH_USER,
      password: process.env.COMFY_AUTH_PASS,
    };

    const imageResponse = await axios.get(`${comfyUrl}/view?filename=output/${filename}`, {
      responseType: 'stream',
      auth,
    });

    // Sube la imagen procesada a Cloudinary en carpeta 'rmbg'
    const publicId = `rmbg/${nickname}/${Date.now()}_${filename.replace(/\.[^/.]+$/, '')}`;
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { public_id: publicId, resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      imageResponse.data.pipe(stream);
    });

    // Actualiza Mongo con URL final
    await ImagenGenerada.findOneAndUpdate(
      { prompt_id: resultado.prompt_id },
      {
        finalUrl: uploadResult.secure_url,
        status: 'completada',
      }
    );

    // Devuelve al frontend URL original (input) y URL sin fondo (output)
    res.json({
      inputUrl: resultado.inputUrl,
      outputUrl: uploadResult.secure_url,
    });

  } catch (error) {
    console.error('Error en removeBackground:', error);
    res.status(500).json({ error: error.message });
  }
}


const esperarHastaObtenerImagen = async (promptId, comfyUrl, intervalo = 5000) => {
  const auth = getComfyAuth();
  let intentos = 0;

  while (true) {
    try {
      const { data } = await axios.get(`${comfyUrl}/history/${promptId}`, auth);
      const entry = data[promptId] || data;
      const nodoSalida = Object.values(entry.outputs || {}).find(n => n?.images?.length > 0);

      if (nodoSalida && nodoSalida.images.length > 0) {
        console.log(`Imagen encontrada tras ${intentos} intentos.`);
        return nodoSalida.images[0].filename;
      }

      intentos++;
      console.log(`Intento ${intentos}: imagen aún no disponible, esperando ${intervalo}ms...`);
      await esperar(intervalo);

    } catch (error) {
      console.warn(`Error consultando el historial de ComfyUI (intento ${intentos}):`, error.message);
      await esperar(intervalo);
    }
  }
};