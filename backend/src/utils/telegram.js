import axios from 'axios';
import sharp from 'sharp';
import FormData from 'form-data';
import https from 'https';

export const enviarImagenTelegram = async (imagen) => {
  const promptText = imagen.prompt || 'Sin descripción';

  const mensaje = `📸 *Imagen generada por:* _${imagen.user?.nickname || 'Usuario desconocido'}_\n\n` +
                  `🧠 *Prompt:* ${promptText}\n\n` +
                  `📅 *Fecha:* ${new Date(imagen.createdAt).toLocaleDateString('es-ES')}\n\n` +
                  `🌐 _Generado en_ [KeikoPrompts](https://keikodev.es/keikoprompts) ✨`;

  const url = `https://api.telegram.org/bot${process.env.KEIKOIA_BOT_TOKEN}/sendPhoto`;

  try {
    const imageResponse = await axios.get(imagen.finalUrl, {
      responseType: 'arraybuffer',
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });

    // Validar y convertir la imagen
    const processedImage = await sharp(imageResponse.data)
      .resize({
        width: 4096,
        height: 4096,
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    const form = new FormData();
    form.append('chat_id', process.env.KEIKOIA_CHANNEL_ID);
    form.append('photo', processedImage, { filename: 'imagen.jpg' });
    form.append('caption', mensaje);
    form.append('parse_mode', 'Markdown');

    const result = await axios.post(url, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity
    });

    // console.log('✅ Imagen enviada con éxito:', result.data);
  } catch (error) {
    console.error('❌ Error al enviar imagen a Telegram:', error.response?.data || error.message);
    throw error;
  }
};
