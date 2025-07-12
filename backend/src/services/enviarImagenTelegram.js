import axios from 'axios';
import FormData from 'form-data';

export const enviarImagenTelegram = async ({ buffer, filename, caption }) => {
  const botToken = process.env.KEIKOIA_BOT_TOKEN;
  const chatId = process.env.KEIKOIA_CHANNEL_ID; // puede ser "@nombre_canal"

  const form = new FormData();
  form.append('chat_id', chatId);
  form.append('photo', buffer, { filename });
  if (caption) form.append('caption', caption);

  const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendPhoto`, form, {
    headers: form.getHeaders(),
  });

  return response.data;
};
