import fs from 'fs';
import path from 'path';

import fetchNasaImageDaily from './jobs/fetchNasaImage.js';
import { startMotoGPNotifier } from './services/motogp-notifier.js';
import { startF1Notifier } from './services/f1-notifier.js';
import { startDailyEventScheduler } from './notifier/coreScheduler.js';
import { iniciarSchedulerFutbol } from './jobs/futbolScheduler.js';
import { startEnrichSpacexJob } from './jobs/enrichSpacexJob.js';
import { startComfySocketWatcher } from './services/comfySocketWatcher.js';
import { scheduleIGDailyJob } from './jobs/igDailyJob.js';
import scheduleIGDailyCarouselJobAccount2 from './jobs/igDailyCarouselJob.account2.js';
import scheduleIGDailyReelJobAccount2 from './jobs/igDailyReelJob.account2.js';
import { runScheduledImports } from './services/emailScheduler.js';

let runtimeInitialized = false;

const runSafe = (name, fn) => {
  try {
    fn();
  } catch (error) {
    console.error(`❌ Error iniciando ${name}:`, error?.message || error);
  }
};

const importJobModule = async (modulePath) => {
  try {
    await import(modulePath);
  } catch (error) {
    console.error(`❌ Error cargando módulo ${modulePath}:`, error?.message || error);
  }
};

export const initializeRuntimeTasks = async () => {
  if (runtimeInitialized) {
    console.log('ℹ️ Runtime tasks ya inicializadas, se omite reinicio.');
    return;
  }
  runtimeInitialized = true;

  // Cargar jobs con side-effects explícitamente tras arrancar servidor
  await importJobModule('./jobs/spaceXJob.js');
  await importJobModule('./jobs/igraalJob.js');
  await importJobModule('./jobs/syncWeeklyTop.js');

  runSafe('fetchNasaImageDaily', () => fetchNasaImageDaily());
  runSafe('startMotoGPNotifier', () => startMotoGPNotifier());
  runSafe('startF1Notifier', () => startF1Notifier());
  runSafe('startDailyEventScheduler', () => startDailyEventScheduler());
  runSafe('iniciarSchedulerFutbol', () => iniciarSchedulerFutbol(process.env.MONGO_URI));

  runSafe('startEnrichSpacexJob', () => startEnrichSpacexJob());
  runSafe('startComfySocketWatcher', () => startComfySocketWatcher());

  if (process.env.IG_SCHEDULER_ENABLED === 'true') {
    runSafe('scheduleIGDailyJob', () => scheduleIGDailyJob());
    runSafe('scheduleIGDailyCarouselJobAccount2', () => scheduleIGDailyCarouselJobAccount2());
    runSafe('scheduleIGDailyReelJobAccount2', () => scheduleIGDailyReelJobAccount2());
  }

  const uploadDir = path.resolve('temp_uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('📁 Carpeta "temp_uploads" creada automáticamente');
  }

  const IMPORT_INTERVAL = 1000 * 60 * 60 * 6;

  setTimeout(() => {
    console.log('▶️ Importación automática inicial');
    runScheduledImports();
  }, 10000);

  setInterval(() => {
    console.log('🕒 Ejecutando importación programada...');
    runScheduledImports();
  }, IMPORT_INTERVAL);
};
