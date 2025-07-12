// src/controllers/telegramController.js
import ImagenGenerada from '../models/ImagenGenerada.js';
import { enviarImagenTelegram } from '../utils/telegram.js';

export const enviarDesdeMongoATelegram = async (req, res) => {
  try {
    const {
      prompt_id,
      finalUrl,
      nickname,
      prompt,
      createdAt
    } = req.body;

    if (!prompt_id || !finalUrl) {
      return res.status(400).json({ success: false, message: 'Faltan datos obligatorios.' });
    }

    const imagen = {
      _id: prompt_id,
      finalUrl,
      createdAt: createdAt || new Date(),
      user: { nickname },
      prompt: prompt // ✅ prompt real
    };

    await enviarImagenTelegram(imagen);

    // Marca como enviada en la base de datos
    await ImagenGenerada.findByIdAndUpdate(prompt_id, {
      status: 'entregada_telegram'
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error al enviar a Telegram:', err);
    res.status(500).json({ success: false, message: 'Error interno al enviar a Telegram.' });
  }
};
