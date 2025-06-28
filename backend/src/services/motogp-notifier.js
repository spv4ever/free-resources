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

// 3. Función auxiliar para Hashtags
const createHashtag = (text) => {
  if (!text) return '';
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
      const circuitHashtag = createHashtag(event.location);
      const categoryHashtag = createHashtag(event.category);
      const hashtags = `${circuitHashtag} ${categoryHashtag}`.trim();

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

/**
 * Inicia el sistema de notificaciones de MotoGP, PERO SOLO EN PRODUCCIÓN.
 * Se encarga de crear el bot y programar la tarea cron.
 */
export const startMotoGPNotifier = () => {
  // --- ¡AQUÍ ESTÁ EL CAMBIO FINAL! ---
  // Condición de salida si no estamos en el entorno de producción.
  if (process.env.NODE_ENV !== 'production') {
    console.log('ℹ️ El notificador de MotoGP está deshabilitado en el entorno de desarrollo (NODE_ENV no es "production").');
    return; // Detiene la ejecución de esta función.
  }

  // El resto del código solo se ejecutará si la condición anterior es falsa.
  if (!token || !chatId || !apiUrl) {
    console.warn('⚠️ El notificador de MotoGP (en producción) no se iniciará por falta de configuración.');
    return;
  }

  bot = new TelegramBot(token);
  cron.schedule('* * * * *', checkEventsAndNotify);
  
  console.log('🚀 Notificador de eventos de motor para Telegram iniciado en modo PRODUCCIÓN.');
  
  checkEventsAndNotify();
};