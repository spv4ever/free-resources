// src/controllers/fluxController.js
import { generarImagen as generarImagenServicio } from '../services/generarImagenOptimizada.js';
import { consultarImagenGenerada } from '../services/resultadoImagenService.js';
import ImagenGenerada from '../models/ImagenGenerada.js';
import { getComfyUrl } from '../services/comfyService.js';
import { getComfyAuth } from '../utils/comfyAuth.js';
import { trackPendingJob } from '../services/comfySocketWatcher.js';
import { manejarFinalizacionDeJob } from '../services/manejoResultadoImagen.js';
import { consumirToken } from '../services/tokenService.js';
import Prompt from '../keikoprompts/models/KeikoPrompt.js';
import Pack from '../keikoprompts/models/KeikoPromptPack.js';
import { uploadImageBufferToImageKit } from '../services/imagekit.js';
import sharp from 'sharp'; // si no lo usas aquí, puedes quitarlo más adelante
import https from 'https';  // idem

import axios from 'axios';

/* ======================= GENERAR ======================= */
export const generarImagen = async (req, res) => {
  try {
    const {
      prompt,
      ratio,
      seed,
      steps,
      advancedMode = false,
      removeBackground = false,
      promptRef,
      engine = null // ✅ NUEVO
    } = req.body;

    const filename_prefix = req.user.nickname || 'keiko';

    // 🔎 Categoría (si viene referencia)
    let category = '';
    if (promptRef) {
      const promptDoc = await Prompt.findById(promptRef).populate('packId');
      category = promptDoc?.packId?.category || '';
    }
    console.log('📦 Categoría detectada para promptRef:', category);

    // 💳 Consumir token
    await consumirToken({
      userId: req.user._id,
      type: 'generation',
      tool: 'comfyui',
      description: `Generación de imagen con prompt: ${prompt}`
    });

    // 🎚️ Steps por categoría
    const categoriasAltaCalidad = ['stickers', 'tshirts', 't-shirts', 't-shirt'];
    const stepsFinal =
      engine === 'zimage'
        ? 10
        : (categoriasAltaCalidad.includes((category || '').toLowerCase())
            ? 30
            : (steps || 25));
    console.log('⚡ Engine:', engine, '| stepsFinal:', stepsFinal);
    // 🚀 Lanzar generación
    const resultado = await generarImagenServicio({
      prompt,
      ratio,
      seed,
      steps: stepsFinal,
      filename_prefix,
      removeBackground,
      advancedMode,
      category,
      engine // ✅ NUEVO  
    });

    console.log('📥 Resultado de generarImagenServicio:', resultado);

    if (!resultado || !resultado.prompt_id) {
      throw new Error('❌ No se recibió prompt_id desde generarImagenServicio');
    }

    // 👤 Leer usuario (para visibilidad)
    const User = await import('../models/User.js').then(m => m.default);
    const userDb = await User.findById(req.user._id);

    console.log('🔍 esPublica en body:', req.body.esPublica);
    console.log('🔍 permiteImagenesPublicas en usuario:', userDb?.permiteImagenesPublicas);

    const debeSerPublica =
      req.body.esPublica === true ||
      req.body.esPublica === 'true' ||
      userDb?.permiteImagenesPublicas === true;

    // 🗃️ Guardar (sin status → usa default: 'pendiente')
    await ImagenGenerada.create({
      user: req.user._id,
      prompt_id: resultado.prompt_id,
      prompt,
      promptRef,
      public: debeSerPublica
    });

    // 🛰️ Tracking opcional por WS
    trackPendingJob(resultado.prompt_id, {
      userId: req.user._id,
      nickname: filename_prefix,
      prompt
    });

    res.json({ prompt_id: resultado.prompt_id });
  } catch (error) {
    console.error('Error al generar imagen:', error.message);
    res.status(500).json({ error: 'No se pudo generar la imagen' });
  }
};

/* =================== OBTENER (legacy) =================== */
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
        status: 'completada'
      }
    );

    console.log('Resultado:', resultado);
    res.json(resultado);
  } catch (error) {
    console.error('Error al consultar imagen:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/* ============ LISTADO IMÁGENES DEL USUARIO ============ */
export const obtenerImagenesDelUsuario = async (req, res) => {
  try {
    const imagenes = await ImagenGenerada.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'promptRef',
        populate: { path: 'packId' }
      });

    const resultado = imagenes.map(img => ({
      ...img.toObject(),
      promptScene: img.promptRef?.scene || 'Sin título',
      packTitle: img.promptRef?.packId?.title || 'Desconocido'
    }));

    console.log('🖼️ Resultado final con populate:', JSON.stringify(resultado, null, 2));
    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener imágenes del usuario:', error.message);
    res.status(500).json({ error: 'No se pudieron obtener las imágenes' });
  }
};

/* ===================== VERIFICAR ===================== */
export const verificarImagen = async (req, res) => {
  try {
    const { id } = req.params; // promptId
    const comfyUrl = await getComfyUrl('flux');

    const { data } = await axios.get(`${comfyUrl}/history/${id}`, getComfyAuth());
    const entry = data[id] || data;
    const nodoSalida = Object.values(entry.outputs || {}).find(nodo => nodo?.images?.length > 0);

    if (nodoSalida && nodoSalida.images?.length > 0) {
      const { filename } = nodoSalida.images[0];
      const imageUrl = `${comfyUrl}/view?filename=output/${filename}&type=output`;

      // 🔎 Doc en Mongo para conocer user/nickname
      const imagen = await ImagenGenerada.findOne({ prompt_id: id });
      if (imagen) {
        const User = await import('../models/User.js').then(m => m.default);
        const user = await User.findById(imagen.user);

        try {
          // ⚙️ Finalización (sube a Cloudinary/ImageKit y actualiza Mongo → status 'completada' + finalUrl)
          await manejarFinalizacionDeJob(id, {
            userId: imagen.user,
            nickname: user?.nickname || 'keiko',
            prompt: imagen.prompt,
            filename
          });
        } catch (err) {
          // ⏳ Si el manejador sigue procesando (timeout controlado), responde 202 para que el front siga pollando
          if (err?.http_code === 420) {
            const doc = await ImagenGenerada.findOne({ prompt_id: id }).select('status finalUrl filename');
            return res.status(202).json({
              found: true,
              status: doc?.status || 'procesando',
              finalUrl: doc?.finalUrl || null,
              filename: doc?.filename || filename,
              imageUrl
            });
          }
          console.warn(`[verificarImagen] manejarFinalizacionDeJob error: ${err.message}`);
          return res.status(500).json({ error: 'FINALIZATION_ERROR' });
        }
      }

      // ✅ (opcional) Mantener también la URL local (idempotente)
      await ImagenGenerada.findOneAndUpdate(
        { prompt_id: id },
        { filename, url: imageUrl },
        { new: true }
      );

      // 📤 Responder con el estado real en Mongo
      const doc = await ImagenGenerada.findOne({ prompt_id: id }).select('status finalUrl filename');
      return res.status(200).json({
        found: true,
        status: doc?.status || 'completada',
        finalUrl: doc?.finalUrl || null,
        filename: doc?.filename || filename,
        imageUrl
      });
    }

    // 💤 Aún no hay outputs en history
    return res.status(200).json({ found: false, status: 'pendiente' });
  } catch (err) {
    console.warn(`🔍 Verificación fallida: ${err.message}`);
    return res.status(200).json({ found: false, status: 'pendiente' });
  }
};

/* =========== SERVIR IMAGEN DIRECTA DESDE COMFY =========== */
export const servirImagenDesdeComfy = async (req, res) => {
  try {
    const { filename } = req.params;
    const comfyUrl = await getComfyUrl('flux'); // p.ej. https://xxxx.ngrok-free.app
    const auth = {
      username: process.env.COMFY_AUTH_USER,
      password: process.env.COMFY_AUTH_PASS
    };

    const url = `${comfyUrl}/view?filename=output/${filename}&type=output`;
    const response = await axios.get(url, {
      responseType: 'stream',
      auth
    });

    res.setHeader('Content-Type', response.headers['content-type'] || 'image/png');
    response.data.pipe(res);
  } catch (err) {
    console.error('❌ Error al servir imagen:', err.message);
    res.status(500).send('No se pudo obtener la imagen');
  }
};
