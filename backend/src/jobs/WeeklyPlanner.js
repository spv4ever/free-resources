// src/jobs/WeeklyPlanner.js
import cron from 'node-cron';
import InstagramAccount from '../models/InstagramAccount.js';
import Schedule from '../models/Schedule.js';
import ExecutionLog from '../models/ExecutionLog.js';
import { run as runAdapter } from './adapters/runner.js';

const MAP_DAY = { sun:0, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6 };

// accountId -> [CronTask]
const REGISTRY = new Map();
// accountId -> [{ label, H, M, dow, tz, expr }]
const REGISTRY_META = new Map();

function stopAllFor(accountId){
  const arr = REGISTRY.get(accountId) || [];
  arr.forEach(t => t.stop());
  REGISTRY.set(accountId, []);
  REGISTRY_META.set(accountId, []);
}

function addTask(accountId, task){
  const arr = REGISTRY.get(accountId) || [];
  arr.push(task);
  REGISTRY.set(accountId, arr);
}

function addTaskMeta(accountId, meta){
  const arr = REGISTRY_META.get(accountId) || [];
  arr.push(meta);
  REGISTRY_META.set(accountId, arr);
}

export function getRegistrySummary(accountId){
  return REGISTRY_META.get(accountId) || [];
}

function slotKey(tz, isoMinute) {
  return `${isoMinute}@${tz}`;
}

async function safeRun({ account, type, tz }) {
  const now = new Date();
  const isoMinute = new Date(now.setSeconds(0,0)).toISOString();
  const key = slotKey(tz, isoMinute);

  try {
    await ExecutionLog.create({
      accountId: account._id, type, source: 'weekly', slotKey: key
    });
  } catch (e) {
    if (process.env.ALLOW_DUPLICATE_SLOT !== 'true') {
      console.log(`[skip] duplicate ${account.alias} ${type} ${key}`);
      return;
    }
  }

  if (process.env.DEBUG_WEEKLY === '1') {
    const nowTz = new Date().toLocaleString('es-ES', { timeZone: tz });
    console.log(`[weekly] firing ${account.alias}:${type} @ ${nowTz} TZ=${tz}`);
  }

  const accountCtx = {
    _id: account._id,
    alias: account.alias,
    igUserId: account.igUserId,
    accessToken: account.accessToken,
    timezone: tz,
  };

  await runAdapter(type, accountCtx);
}

function scheduleOne({ tz, dow, H, M, label, cb, accountId }){
  const expr = `${M} ${H} * * ${dow}`;
  const task = cron.schedule(expr, cb, { timezone: tz });
  addTask(accountId, task);
  addTaskMeta(accountId, { label, H, M, dow, tz, expr });

  const nowTz = new Date().toLocaleString('es-ES', { timeZone: tz });
  console.log(`→ [weekly] scheduled ${label} cron="${expr}" TZ=${tz} now=${nowTz}`);
}

export async function rebuildWeeklyForAccount(accountId){
  stopAllFor(accountId);

  const [account, sched] = await Promise.all([
    InstagramAccount.findById(accountId).lean(),
    Schedule.findOne({ accountId }).lean()
  ]);

  if (!account?.isEnabled || !sched) {
    console.log(`[weekly][rebuild] skip accountId=${accountId} isEnabled=${account?.isEnabled} hasSched=${!!sched}`);
    return;
  }

  const tz = account.timezone || 'Europe/Madrid';
  const TYPES = ['post','carousel','reel'];
  let scheduledCount = 0;

  for (const type of TYPES){
    const raw = sched[type] || {};
    const weekly = (raw && typeof raw.toObject === 'function') ? raw.toObject() : raw;
    console.log(`[weekly][rebuild] account=${account.alias} type=${type} keys=`, Object.keys(weekly));

    for (const [dayKey, cfg] of Object.entries(weekly)){
      if (!cfg?.enabled) {
        console.log(`[weekly][rebuild] skip ${type}:${dayKey} enabled=${cfg?.enabled} time=${cfg?.time}`);
        continue;
      }
      const [H, M] = (cfg.time || '10:00').split(':').map(Number);
      const dow = MAP_DAY[dayKey];
      if (typeof dow !== 'number' || Number.isNaN(H) || Number.isNaN(M)) {
        console.log(`[weekly][rebuild] bad slot ${type}:${dayKey} time=${cfg?.time} dow=${dow}`);
        continue;
      }
      scheduleOne({
        tz, dow, H, M, accountId: account._id.toString(),
        label: `${account.alias}:${type}:${dayKey}`,
        cb: () => safeRun({ account, type, tz }).catch(err => console.error(err))
      });
      scheduledCount++;
    }
  }

  console.log(`[weekly][rebuild] DONE account=${account.alias} scheduled=${scheduledCount}`);
}

export async function bootWeeklyPlanner(){
  const accounts = await InstagramAccount.find({ isEnabled:true }).lean();
  for (const acc of accounts) await rebuildWeeklyForAccount(acc._id);
}

// (opcional) sonda por minuto para verificar que cron late
export function startCronProbe(tz = 'Europe/Madrid') {
  if (process.env.DEBUG_WEEKLY !== '1') return;
  cron.schedule('*/1 * * * *', () => {
    const nowTz = new Date().toLocaleString('es-ES', { timeZone: tz });
    console.log(`[probe] tick @ ${nowTz} TZ=${tz}`);
  }, { timezone: tz });
}
