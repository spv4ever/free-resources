// motogp-notifier.js

import dotenv from 'dotenv';
import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';

const TIMEZONE = 'Europe/Madrid';

const getMadridDate = (date = new Date()) => {
  return new Date(date.toLocaleString('en-US', { timeZone: TIMEZONE }));
};

const formatHourMadrid = (dateStr) => {
  return new Date(new Date(dateStr).toLocaleString('en-US', { timeZone: TIMEZONE }))
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getMadridDateString = (date = new Date()) => {
  return getMadridDate(date).toISOString().split('T')[0];
};

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const apiUrl = `${process.env.API_URL}/api/sports/motogp/next`;

const createHashtag = (text) => {
  if (!text) return '';
  return `#${text.replace(/[^a-zA-Z0-9]/g, '')}`;
};

let bot;
const notifiedEvents = new Map();
let dailySummarySentDate = null;

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
  const now = getMadridDate();
  const today = getMadridDateString(now);

  if (dailySummarySentDate === today) return;

  const todayEvents = events.filter(e =>
    new Date(new Date(e.start).toLocaleString('en-US', { timeZone: TIMEZONE }))
      .toISOString()
      .startsWith(today)
  );

  if (todayEvents.length === 0) return;

  const firstEventTime = getMadridDate(new Date(todayEvents[0].start));
  const diffMinutes = Math.floor((firstEventTime - now) / (1000 * 60));

  if (diffMinutes <= 30 && diffMinutes >= 29) {
    const resumen = todayEvents.map(e => {
      const hour = formatHourMadrid(e.start);
      return `🕒 <b>${hour}</b> — <i>${e.title}</i>`;
    }).join('\n');

    const circuit = createHashtag(todayEvents[0].location);
    sendMessage(`<b>📅 Día de Carreras</b>\n\nEventos para hoy:\n\n${resumen}\n\n${circuit}`);

    dailySummarySentDate = today;
  }
};

export const checkEventsAndNotify = async () => {
  console.log(`\n[${new Date().toLocaleString()}] 🔄 Comprobando eventos MotoGP...`);

  try {
    const res = await axios.get(apiUrl);
    const allEvents = res.data.events || [];

    const futureEvents = allEvents
      .filter(e => new Date(e.start) > new Date())
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    if (futureEvents.length === 0) {
      console.log('ℹ️ No se encontraron próximos eventos MotoGP.');
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
      const now = getMadridDate();
      const eventStart = getMadridDate(new Date(event.start));
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
          sendMessage(`<b>🔥 ¡Atención Pilotos! 🔥</b>\n\nSolo faltan <b>5 minutos</b> para que empiece:\n<i>${event.title}</i>\n\n${hashtags}`);
        }
        eventNotifications.push('5m');
      }

      if (eventNotifications.length > 0) {
        notifiedEvents.set(event._id, eventNotifications);
      }
    }

  } catch (error) {
    console.error(`❌ Error al obtener o procesar los eventos MotoGP: ${error.message}`);
  }
};

export const startMotoGPNotifier = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('ℹ️ El notificador de MotoGP está deshabilitado en desarrollo.');
    return;
  }

  if (!token || !chatId || !apiUrl) {
    console.warn('⚠️ Falta configuración para iniciar el bot de MotoGP.');
    return;
  }

  bot = new TelegramBot(token);
  console.log('🤖 Bot de MotoGP inicializado (sin cron interno).');
};

export const enviarResumenDiario = async () => {
  try {
    const res = await axios.get(apiUrl);
    const eventos = res.data.events || [];

    const hoy = getMadridDateString();
    const eventosHoy = eventos
      .filter(e =>
        new Date(new Date(e.start).toLocaleString('en-US', { timeZone: TIMEZONE }))
          .toISOString()
          .startsWith(hoy)
      )
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    if (eventosHoy.length === 0) {
      console.log('ℹ️ No hay eventos hoy para mostrar en el resumen.');
      return;
    }

    const resumen = eventosHoy.map(e => {
      const hour = formatHourMadrid(e.start);
      return `🕒 <b>${hour}</b> — <i>${e.title}</i>`;
    }).join('\n');

    const circuito = createHashtag(eventosHoy[0].location);
    sendMessage(`<b>📅 Día de Carreras</b>\n\nEventos para hoy:\n\n${resumen}\n\n${circuito}`);
  } catch (error) {
    console.error('❌ Error al forzar resumen diario:', error.message);
  }
};