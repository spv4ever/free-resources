// src/controllers/fluxController.js
import { generarImagenOptimizada } from '../services/generarImagenOptimizada.js';
import { consultarImagenGenerada } from '../services/resultadoImagenService.js';
import ImagenGenerada from '../models/ImagenGenerada.js';
import { getComfyUrl } from '../services/comfyService.js';
import { getComfyAuth } from '../utils/comfyAuth.js';
import { trackPendingJob } from '../services/comfySocketWatcher.js';
import { manejarFinalizacionDeJob } from '../services/manejoResultadoImagen.js';



import axios from 'axios';

export const generarImagen = async (req, res) => {
  try {
    const { prompt, ratio, seed, steps } = req.body;
    const filename_prefix = req.user.nickname || 'keiko';

    const resultado = await generarImagenOptimizada({
      //prompt: `aidmaHyperrealism , ${prompt}`,
      //prompt: `Anime Scene, ${prompt}`,
      prompt,
      ratio,
      seed,
      steps,
      filename_prefix,
    });

    await ImagenGenerada.create({
      user: req.user._id,
      prompt_id: resultado.prompt_id,
      prompt,
    });
    trackPendingJob(resultado.prompt_id, {
      userId: req.user._id,
      nickname: filename_prefix, // ya es el nickname
      prompt
    });

    res.json({ prompt_id: resultado.prompt_id });
  } catch (error) {
    console.error('Error al generar imagen:', error.message);
    res.status(500).json({ error: 'No se pudo generar la imagen' });
  }
};

export const obtenerImagen = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Obteniendo imagen para prompt_id:', id);
    const resultado = await consultarImagenGenerada(id);
    await ImagenGenerada.findOneAndUpdate(
      { prompt_id: id },
      {
        filename: resultado.filename,
        url: resultado.imageUrl,
        status: 'completada',
      }
    );
    console.log('Resultado:', resultado);
    res.json(resultado);
  } catch (error) {
    console.error('Error al consultar imagen:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const obtenerImagenesDelUsuario = async (req, res) => {
  try {
    const imagenes = await ImagenGenerada.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(imagenes);
  } catch (error) {
    console.error('Error al obtener imágenes:', error.message);
    res.status(500).json({ error: 'No se pudieron obtener las imágenes del usuario' });
  }
};

export const verificarImagen = async (req, res) => {
  try {
    const { id } = req.params;
    const comfyUrl = await getComfyUrl('flux');

    const { data } = await axios.get(`${comfyUrl}/history/${id}`, getComfyAuth());
    const entry = data[id] || data;
    const nodoSalida = entry.outputs?.['30'];

    if (nodoSalida && nodoSalida.images?.length > 0) {
      const { filename } = nodoSalida.images[0];
      const imageUrl = `${comfyUrl}/view?filename=output/${filename}`;

      // 🔎 Buscar los datos guardados en Mongo
      const imagen = await ImagenGenerada.findOne({ prompt_id: id });

      // ⚡ Subir a Cloudinary y actualizar
      if (imagen) {
        await manejarFinalizacionDeJob(id, {
          userId: imagen.user,
          nickname: req.user.nickname, // puede que quieras también guardar esto en Mongo
          prompt: imagen.prompt,
          filename
        });
      }

      // ✅ (opcional) Mantener también la URL local
      await ImagenGenerada.findOneAndUpdate(
        { prompt_id: id },
        {
          filename,
          url: imageUrl,
          status: 'completada'
        }
      );

      return res.json({ found: true, filename, imageUrl });
    }

    return res.json({ found: false });
  } catch (err) {
    console.warn(`🔍 Verificación fallida: ${err.message}`);
    return res.status(200).json({ found: false });
  }
};
// src/controllers/fluxController.js


export const servirImagenDesdeComfy = async (req, res) => {
  try {
    const { filename } = req.params;
    const comfyUrl = await getComfyUrl('flux'); // por ejemplo, https://xxxx.ngrok-free.app
    const auth = {
      username: process.env.COMFY_AUTH_USER,
      password: process.env.COMFY_AUTH_PASS
    };

    const response = await axios.get(`${comfyUrl}/view?filename=output/${filename}`, {
      responseType: 'stream',
      auth
    });

    res.setHeader('Content-Type', response.headers['content-type']);
    response.data.pipe(res);
  } catch (err) {
    console.error('❌ Error al servir imagen:', err.message);
    res.status(500).send('No se pudo obtener la imagen');
  }
};
