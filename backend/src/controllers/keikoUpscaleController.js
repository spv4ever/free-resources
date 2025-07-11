import { generarImagenUpscale } from '../services/generarImagenOptimizada.js';
import ImagenGenerada from '../models/ImagenGenerada.js';
import { getComfyUrl } from '../services/comfyService.js';
import { getComfyAuth } from '../utils/comfyAuth.js';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';

const esperar = ms => new Promise(r => setTimeout(r, ms));

export async function upscaleImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });

    const originalName = req.body.filename || req.file.originalname || `image_${Date.now()}`;
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const filenameUpscale = `${baseName}_UPSCALE.png`;

    const inputBuffer = req.file.buffer;
    const userId = req.user._id;
    const nickname = req.user.nickname;

    const resultado = await generarImagenUpscale({
        imageBuffer: inputBuffer,
        filenameUpscale,
        upscaleFactor: req.body.upscaleFactor || 'x2'
        });

    if (!resultado.prompt_id) throw new Error('No se recibió prompt_id desde ComfyUI');

    await ImagenGenerada.create({
      user: userId,
      prompt_id: resultado.prompt_id,
      prompt: 'Upscale',
      public: false,
      inputUrl: resultado.inputUrl,
      filename: filenameUpscale,
    });

    const comfyUrl = await getComfyUrl('flux');
    const filename = await esperarHastaObtenerImagen(resultado.prompt_id, comfyUrl);

    const imageResponse = await axios.get(`${comfyUrl}/view?filename=output/${filename}`, {
      responseType: 'stream',
      auth: getComfyAuth().auth
    });

    const publicId = `upscale/${nickname}/${Date.now()}_${filename.replace(/\.[^/.]+$/, '')}`;
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { public_id: publicId, resource_type: 'image' },
        (error, result) => error ? reject(error) : resolve(result)
      );
      imageResponse.data.pipe(stream);
    });

    await ImagenGenerada.findOneAndUpdate(
      { prompt_id: resultado.prompt_id },
      { finalUrl: uploadResult.secure_url, status: 'completada' }
    );

    res.json({
      inputUrl: resultado.inputUrl,
      outputUrl: uploadResult.secure_url,
    });

  } catch (error) {
    console.error('Error en upscaleImage:', error);
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
      if (nodoSalida) return nodoSalida.images[0].filename;

      intentos++;
      console.log(`Intento ${intentos}: esperando ${intervalo}ms...`);
      await esperar(intervalo);

    } catch (error) {
      console.warn(`Error en intento ${intentos}:`, error.message);
      await esperar(intervalo);
    }
  }
};
