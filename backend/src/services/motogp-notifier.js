// motogp-notifier.js

// 1. Importación de Módulos
import dotenv from 'dotenv';
import axios from 'axios';
import cron from 'node-cron';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

// 2. Configuración y Constantes
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const apiUrl = `${process.env.API_URL}/api/sports/motogp/next`;

// 3. Verificación de Variables de Entorno
if (!token || !chatId || !apiUrl) {
  console.error('❌ Error: Faltan variables de entorno. Asegúrate de que TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID y API_URL estén definidos.');
}

// --- ¡NUEVA FUNCIÓN AUXILIAR! ---
/**
 * Convierte un string en un hashtag válido para Telegram.
 * Elimina espacios y caracteres especiales.
 * @param {string} text - El texto a convertir.
 * @returns {string} - El texto formateado como hashtag (ej: #MiHashtag) o un string vacío si no hay texto.
 */
const createHashtag = (text) => {
  if (!text) return '';
  // Elimina todos los caracteres que no sean letras o números y lo prefija con #
  return `#${text.replace(/[^a-zA-Z0-9]/g, '')}`;
};


// 4. Lógica del Notificador
let bot;
const notifiedEvents = new Map();

const sendMessage = (message) => {
  if (!bot) return;
  bot.sendMessage(chatId, message, { parse_mode: 'HTML' })
    .then(() => {
      const cleanMessage = message.replace(/<[^>]*>/g, ' ').replace(/\s\s+/g, ' ').trim();
      console.log(`✅ Mensaje enviado a Telegram: "${cleanMessage}"`);
    })
    .catch(err => console.error(`❌ Error al enviar mensaje a Telegram: ${err.response?.body?.description || err.message}`));
};

const checkEventsAndNotify = async () => {
  console.log(`\n[${new Date().toLocaleString()}] 🔄 Comprobando eventos del fin de semana...`);

  try {
    const res = await axios.get(apiUrl);
    const allEvents = res.data.events || [];
    
    const futureEvents = allEvents
      .filter(e => new Date(e.start) > new Date())
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    if (futureEvents.length === 0) {
      console.log('ℹ️ No se encontraron próximos eventos para el fin de semana.');
      return;
    }
    
    const currentEventIds = new Set(futureEvents.map(e => e._id));
    for (const eventId of notifiedEvents.keys()) {
        if (!currentEventIds.has(eventId)) {
            notifiedEvents.delete(eventId);
            console.log(`🗑️ Evento antiguo (${eventId}) limpiado del registro.`);
        }
    }
    
    console.log(`🔍 Encontrados ${futureEvents.length} eventos futuros (todas las categorías). Próximo: "${futureEvents[0].title}"`);

    for (const event of futureEvents) {
      const now = new Date();
      const eventStart = new Date(event.start);
      const diffMinutes = Math.floor((eventStart - now) / (1000 * 60));
      
      const eventNotifications = notifiedEvents.get(event._id) || [];

      // --- ¡GENERACIÓN DE HASHTAGS! ---
      // Obtenemos los datos del evento y los convertimos en hashtags usando nuestra nueva función.
      const circuitHashtag = createHashtag(event.location);
      const categoryHashtag = createHashtag(event.category);
      // Los unimos en un solo string para añadirlos fácilmente a los mensajes.
      const hashtags = `${circuitHashtag} ${categoryHashtag}`.trim();

      // --- ¡MENSAJES ACTUALIZADOS CON HASHTAGS! ---
      // Añadimos la variable `hashtags` al final de cada mensaje.
      if (diffMinutes <= 60 && diffMinutes >= 59 && !eventNotifications.includes('60m')) {
        sendMessage(`<b>🏁 Aviso de Evento 🏁</b>\n\nFalta <b>1 hora</b> para el inicio de:\n<i>${event.title}</i>\n\n${hashtags}`);
        eventNotifications.push('60m');
      }
      else if (diffMinutes <= 5 && diffMinutes >= 4 && !eventNotifications.includes('5m')) {
        sendMessage(`<b>🔥 ¡Atención Pilotos! 🔥</b>\n\nSolo faltan <b>5 minutos</b> para que empiece:\n<i>${event.title}</i>\n\n${hashtags}`);
        eventNotifications.push('5m');
      }
      else if (diffMinutes <= 0 && diffMinutes >= -1 && !eventNotifications.includes('0m')) {
        sendMessage(`<b>🟢 ¡SEMÁFORO EN VERDE! 🟢</b>\n\n¡Arranca ahora mismo el evento!\n<i>${event.title}</i>\n\n${hashtags}`);
        eventNotifications.push('0m');
      }

      if (eventNotifications.length > 0) {
        notifiedEvents.set(event._id, eventNotifications);
      }
    }

  } catch (error) {
    console.error(`❌ Error al obtener o procesar los eventos: ${error.message}`);
  }
};

// 5. Función de Arranque (la que se exporta y se llama desde app.js)
export const startMotoGPNotifier = () => {
  if (!token || !chatId || !apiUrl) {
    console.warn('⚠️ El notificador de MotoGP no se iniciará por falta de configuración.');
    return;
  }

  bot = new TelegramBot(token);
  cron.schedule('* * * * *', checkEventsAndNotify);
  console.log('🚀 Notificador de eventos de motor para Telegram listo e integrado.');
  checkEventsAndNotify();
};