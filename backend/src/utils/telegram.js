import axios from 'axios';

export const enviarImagenTelegram = async (imagen) => {
  const promptText = imagen.prompt || 'Sin descripción';
  const mensaje = `📸 *Imagen generada por:* _${imagen.user?.nickname || 'Usuario desconocido'}_

🧠 *Prompt:* ${promptText}

📅 *Fecha:* ${new Date(imagen.createdAt).toLocaleDateString()}

🌐 _Generado en_ [KeikoPrompts](https://keikodev.es/keikoprompts) ✨`;


  const url = `https://api.telegram.org/bot${process.env.KEIKOIA_BOT_TOKEN}/sendPhoto`;

  const payload = {
    chat_id: process.env.KEIKOIA_CHANNEL_ID,
    photo: imagen.finalUrl,
    caption: mensaje,
    parse_mode: 'Markdown' // ✅ Esta línea es clave
    
  };

  // console.log('➡️ Enviando imagen a Telegram...');
  // console.log('Bot URL:', url);
  // console.log('Payload:', payload);

  try {
    const response = await axios.post(url, payload);
    console.log('✅ Imagen enviada con éxito:', response.data);
  } catch (error) {
    console.error('❌ Error al enviar imagen a Telegram:', error.response?.data || error.message);
    throw error; // para que el controlador devuelva 500
  }
};
