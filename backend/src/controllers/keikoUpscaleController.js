import { generarImagenUpscale } from '../services/generarImagenOptimizada.js';
import ImagenGenerada from '../models/ImagenGenerada.js';
import { getComfyUrl } from '../services/comfyService.js';
import { getComfyAuth } from '../utils/comfyAuth.js';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import { PassThrough } from 'stream';
import { jobStatusMap  } from '../services/comfySocketWatcher.js'; // 👈 importa esto arriba

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

    // 🚫 No usamos stream para evitar que continúe antes del return
    const comfyFileUrl = `${comfyUrl}/view?filename=output/${filename}`;
    const imageResponse = await axios.get(comfyFileUrl, {
      responseType: 'arraybuffer',
      auth: getComfyAuth().auth
    });

    const imageBuffer = Buffer.from(imageResponse.data);

    // ✅ Verificar tamaño antes de subir
    if (imageBuffer.length > 9_500_000) {
      console.log('⚠️ Imagen supera 9.5 MB, se ofrece vía Telegram');
        // 👇 Evita que el watcher vuelva a ejecutar el job
        jobStatusMap.set(resultado.prompt_id, {
            status: 'oversize',
            createdAt: Date.now()
        });
      return res.status(413).json({
        status: 'exceeds_limit',
        message: 'La imagen generada supera el límite de descarga directa (10 MB)...',
        telegramOption: true,
        prompt_id: resultado.prompt_id,
        telegramJoinUrl: 'https://t.me/keikoia_gallery'
      });
    }

    // ✅ Subir a Cloudinary si es válida
    const publicId = `upscale/${nickname}/${Date.now()}_${filename.replace(/\.[^/.]+$/, '')}`;
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { public_id: publicId, resource_type: 'image' },
        (error, result) => error ? reject(error) : resolve(result)
      );
      const bufferStream = new PassThrough();
      bufferStream.end(imageBuffer);
      bufferStream.pipe(stream);
    });

    await ImagenGenerada.findOneAndUpdate(
      { prompt_id: resultado.prompt_id },
      { finalUrl: uploadResult.secure_url, status: 'completada' }
    );

    res.json({
      inputUrl: resultado.inputUrl,
      outputUrl: uploadResult.secure_url,
      prompt_id: resultado.prompt_id // 👉 para el frontend
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
