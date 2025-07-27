// src/controllers/telegramController.js
import ImagenGenerada from '../models/ImagenGenerada.js';
import { enviarImagenTelegram } from '../utils/telegram.js';

export const enviarDesdeMongoATelegram = async (req, res) => {
  try {
    const {
      prompt_id,     // UUID generado por Flux/ComfyUI
      finalUrl,      // URL de Cloudinary o similar
      nickname,      // nickname del usuario creador
      prompt,        // texto del prompt original
      createdAt      // timestamp de la imagen
    } = req.body;

    // Validación mínima
    if (!prompt_id || !finalUrl) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos obligatorios (prompt_id o finalUrl).'
      });
    }

    // Construimos objeto temporal para enviar a Telegram
    const imagen = {
      _id: prompt_id, // no es el _id de Mongo, es el identificador de comfy
      finalUrl,
      createdAt: createdAt || new Date(),
      user: { nickname },
      prompt
    };

    // Enviar al canal de Telegram
    await enviarImagenTelegram(imagen);

    // Buscar y actualizar por prompt_id (UUID)
    const updated = await ImagenGenerada.findOneAndUpdate(
      { prompt_id },
      { status: 'entregada_telegram' },
      { new: true }
    );

    if (!updated) {
      console.warn(`⚠️ No se encontró ninguna imagen con prompt_id = ${prompt_id}`);
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada en base de datos.'
      });
    }

    res.json({
      success: true,
      mongoId: updated._id, // ✅ devolvemos el _id real si se necesita
      message: 'Imagen enviada y marcada como entregada.'
    });

  } catch (err) {
    console.error('❌ Error al enviar a Telegram:', err);
    res.status(500).json({
      success: false,
      message: 'Error interno al enviar a Telegram.'
    });
  }
};
