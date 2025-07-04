import cron from 'node-cron';
import axios from 'axios';
import { checkEventsAndNotify as checkMotoGP } from '../services/motogp-notifier.js';
import { checkEventsAndNotify as checkF1 } from '../services/f1-notifier.js';  // IMPORTA F1

let dynamicCronTask = null;

const EVENTS_API_URL = `${process.env.API_URL}/api/sports/events/today`;

export const startDailyEventScheduler = () => {
  cron.schedule('5 0 * * *', checkIfTodayHasEvents);
  console.log('📅 Cron diario configurado: revisará eventos a las 00:05 cada día');
};

const checkIfTodayHasEvents = async () => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  try {
    const res = await axios.get(EVENTS_API_URL);
    const allEvents = res.data.events || [];

    const todayEvents = allEvents
      .filter(e => e.start.startsWith(today))
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    if (todayEvents.length === 0) {
      console.log('📭 Hoy no hay eventos, no se activa el cron dinámico.');
      return;
    }

    const firstEventTime = new Date(todayEvents[0].start);
    const startCronTime = new Date(firstEventTime.getTime() - 60 * 60 * 1000); // 1h antes
    const msToStart = startCronTime - now;

    const scheduleDynamicCron = () => {
      if (dynamicCronTask) dynamicCronTask.stop();

      dynamicCronTask = cron.schedule('* * * * *', () => {
        console.log(`[${new Date().toLocaleTimeString()}] 🔁 Notificando eventos activos...`);
        checkMotoGP();
        checkF1();  // AÑADE LA LLAMADA A F1
      });

      console.log(`🟢 Cron dinámico activado desde ${startCronTime.toLocaleTimeString()}`);
    };

    if (msToStart > 0) {
      console.log(`⏳ Cron dinámico se activará a las ${startCronTime.toLocaleTimeString()}`);
      setTimeout(scheduleDynamicCron, msToStart);
    } else {
      console.log('⚠️ Evento muy próximo, arrancando cron dinámico ya.');
      scheduleDynamicCron();
    }

  } catch (err) {
    console.error(`❌ Error al consultar eventos del día: ${err.message}`);
  }
};
