import { enviarImagenTelegram } from '../services/enviarImagenTelegram.js';
import ImagenGenerada from '../models/ImagenGenerada.js';
import { v4 as uuidv4 } from 'uuid';

export const enviarUpscaleATelegram = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });
    // console.log('✅ Recibido POST /upscale-to-telegram');
    // console.log('🧾 Prompt ID recibido:', req.body.prompt_id);
    // console.log('🧾 Usuario:', req.user.nickname);
    const buffer = req.file.buffer;
    const userId = req.user._id;
    const nickname = req.user.nickname;
    const promptId = req.body.prompt_id;

    const promptData = await ImagenGenerada.findOne({ user: userId, prompt_id: promptId });
    if (!promptData) return res.status(404).json({ error: 'Prompt no encontrado.' });

    const caption = `🧠 Imagen generada por @${nickname || 'usuario'}\n📝 Prompt: ${promptData.prompt}`;

    const telegramResponse = await enviarImagenTelegram({
      buffer,
      filename: `${uuidv4()}.jpg`,
      caption
    });

    // Guardamos como entregada por Telegram
    await ImagenGenerada.findOneAndUpdate(
      { prompt_id: promptId },
      {
        finalUrl: `telegram://photo/${telegramResponse.result.message_id}`,
        status: 'entregada_telegram'
      }
    );

    res.json({
      success: true,
      message: 'Imagen enviada a Telegram',
      telegramMessageId: telegramResponse.result.message_id,
    });

  } catch (error) {
    console.error('Error al enviar imagen a Telegram:', error);
    res.status(500).json({ error: 'Error al enviar imagen a Telegram' });
  }
};
