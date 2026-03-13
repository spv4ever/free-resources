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

import './jobs/spaceXJob.js';
import './jobs/igraalJob.js';
import './jobs/syncWeeklyTop.js';

export const initializeRuntimeTasks = () => {
  fetchNasaImageDaily();
  startMotoGPNotifier();
  startF1Notifier();
  startDailyEventScheduler();
  iniciarSchedulerFutbol(process.env.MONGO_URI);

  startEnrichSpacexJob();
  startComfySocketWatcher();

  if (process.env.IG_SCHEDULER_ENABLED === 'true') {
    scheduleIGDailyJob();
    scheduleIGDailyCarouselJobAccount2();
    scheduleIGDailyReelJobAccount2();
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
