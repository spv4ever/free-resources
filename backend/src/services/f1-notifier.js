import dotenv from 'dotenv';
import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import * as dateFnsTz from 'date-fns-tz';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const apiUrl = `${process.env.API_URL}/api/f1/next-race`;

const createHashtag = (text) => {
  if (!text) return '';
  return `#${text.replace(/[^a-zA-Z0-9]/g, '')}`;
};

let bot;
const notifiedEvents = new Map();
let dailySummarySentDate = null;

const timeZone = 'Europe/Madrid'; // Ajusta a tu zona horaria preferida

const sendMessage = (message) => {
  if (!bot) return;
  bot.sendMessage(chatId, message, { parse_mode: 'HTML' })
    .then(() => {
      const cleanMessage = message.replace(/<[^>]*>/g, ' ').replace(/\s\s+/g, ' ').trim();
      console.log(`✅ Mensaje enviado a Telegram: "${cleanMessage}"`);
    })
    .catch(err => console.error(`❌ Error al enviar mensaje a Telegram: ${err.response?.body?.description || err.message}`));
};

const maybeSendDailySummary = (events) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  if (dailySummarySentDate === today) return;

  const todayEvents = events.filter(e => e.start.startsWith(today));
  if (todayEvents.length === 0) return;

  const firstEventTime = new Date(todayEvents[0].start);
  const diffMinutes = Math.floor((firstEventTime - now) / (1000 * 60));

  if (diffMinutes <= 30 && diffMinutes >= 29) {
    const resumen = todayEvents.map(e => {
      const zonedDate = dateFnsTz.utcToZonedTime(new Date(e.start), timeZone);
      const hour = dateFnsTz.format(zonedDate, 'HH:mm');
      return `🕒 <b>${hour}</b> — <i>${e.title}</i>`;
    }).join('\n');

    const circuit = createHashtag(todayEvents[0].location);
    sendMessage(`<b>📅 Día de Carreras - Fórmula 1</b>\n\nEventos para hoy:\n\n${resumen}\n\n${circuit}`);

    dailySummarySentDate = today;
  }
};

export const checkEventsAndNotify = async () => {
  console.log(`\n[${new Date().toLocaleString()}] 🔄 Comprobando eventos Fórmula 1...`);

  try {
    const res = await axios.get(apiUrl);
    const allEvents = res.data.events || [];

    const futureEvents = allEvents
      .filter(e => new Date(e.start) > new Date())
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    if (futureEvents.length === 0) {
      console.log('ℹ️ No se encontraron próximos eventos de Fórmula 1.');
      return;
    }

    const currentEventIds = new Set(futureEvents.map(e => e._id));
    for (const eventId of notifiedEvents.keys()) {
      if (!currentEventIds.has(eventId)) {
        notifiedEvents.delete(eventId);
        console.log(`🗑️ Evento antiguo (${eventId}) limpiado del registro.`);
      }
    }

    maybeSendDailySummary(futureEvents);

    for (let i = 0; i < futureEvents.length; i++) {
      const event = futureEvents[i];
      const now = new Date();
      const eventStart = new Date(event.start);
      const diffMinutes = Math.floor((eventStart - now) / (1000 * 60));

      const eventNotifications = notifiedEvents.get(event._id) || [];
      const circuitHashtag = createHashtag(event.location);
      const categoryHashtag = createHashtag(event.category);
      const hashtags = `${circuitHashtag} ${categoryHashtag}`.trim();

      const previousEvent = futureEvents[i - 1];
      const isConsecutive = previousEvent &&
        Math.abs(new Date(previousEvent.start) - eventStart) <= 10 * 60 * 1000;

      if (diffMinutes <= 5 && diffMinutes >= 4 && !eventNotifications.includes('5m')) {
        if (!isConsecutive) {
          sendMessage(`<b>🔥 ¡Atención Fans de F1! 🔥</b>\n\nSolo faltan <b>5 minutos</b> para que empiece:\n<i>${event.title}</i>\n\n${hashtags}`);
        }
        eventNotifications.push('5m');
      }

      if (eventNotifications.length > 0) {
        notifiedEvents.set(event._id, eventNotifications);
      }
    }

  } catch (error) {
    console.error(`❌ Error al obtener o procesar los eventos de Fórmula 1: ${error.message}`);
  }
};

export const startF1Notifier = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('ℹ️ El notificador de Fórmula 1 está deshabilitado en desarrollo.');
    return;
  }

  if (!token || !chatId || !apiUrl) {
    console.warn('⚠️ Falta configuración para iniciar el bot de Fórmula 1.');
    return;
  }

  bot = new TelegramBot(token);
  console.log('🤖 Bot de Fórmula 1 inicializado (sin cron interno).');
};
