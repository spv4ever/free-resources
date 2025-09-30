// backend/src/jobs/igDailyReelJob.account2.js
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';

function parseHHMM(s, def) {
  if (!s) return def;
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return def;
  return { h: Math.max(0, Math.min(23, +m[1])), min: Math.max(0, Math.min(59, +m[2])) };
}
function pickRandomTime({ start, end }) {
  const a = start.h * 60 + start.min, b = end.h * 60 + end.min;
  const lo = Math.min(a, b), hi = Math.max(a, b);
  const pick = lo + Math.floor(Math.random() * (hi - lo + 1));
  return { h: Math.floor(pick / 60), min: pick % 60 };
}

// ==== Estado simple en disco (por cuenta) ====
function getStateDir() {
  return process.env.IG_STATE_DIR || path.join(process.cwd(), 'tmp');
}
function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}
function stateFileFor(account) {
  const dir = getStateDir();
  ensureDir(dir);
  return path.join(dir, `ig-reel-${account}.json`);
}
function readState(account) {
  const f = stateFileFor(account);
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return {}; }
}
function writeState(account, data) {
  const f = stateFileFor(account);
  try { fs.writeFileSync(f, JSON.stringify(data || {}, null, 2)); } catch { /* ignore */ }
}
function todayStr(tz) {
  // “YYYY-MM-DD” según tz Europe/Madrid (sin librerías extra)
  const now = new Date();
  // Convertimos a hora local de Madrid de forma segura:
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  return fmt.format(now); // en-CA => YYYY-MM-DD
}
function nowHM(tz) {
  const d = new Date();
  const h = +new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hour12: false }).format(d);
  const min = +new Intl.DateTimeFormat('en-GB', { timeZone: tz, minute: '2-digit' }).format(d);
  return { h, min };
}
function compareHM(a, b) {
  return (a.h * 60 + a.min) - (b.h * 60 + b.min);
}

async function fireOnceReel({ base, account, headers, tz }) {
  // === Guardia de idempotencia diaria ===
  const state = readState(account);
  const today = todayStr(tz);
  if (state.lastRunDate === today) {
    console.log(`[IG Reel] ${new Date().toISOString()} — ya publicado hoy (${today}), se omite.`);
    return;
  }

  try {
    let res = await fetch(`${base}/api/instagram/publish-reel-one`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ account })
    });
    if (res.status === 405) {
      res = await fetch(`${base}/api/instagram/publish-reel-one?account=${encodeURIComponent(account)}`, { method: 'GET', headers });
    }
    const text = await res.text();
    console.log(`[IG Reel] ${new Date().toISOString()} status=${res.status} body=${text}`);

    // Marca como ejecutado hoy solo si respuesta 2xx
    if (res.ok) {
      writeState(account, { ...state, lastRunDate: today });
    }
  } catch (e) {
    console.error('[IG Reel] ERROR', e.message);
  }
}

let _task = null;
function scheduleFixed({ expr, tz, base, account, headers }) {
  if (_task) _task.stop();
  _task = cron.schedule(expr, () => fireOnceReel({ base, account, headers, tz }), { timezone: tz });
  console.log(`[IG Reel] fixed → expr="${expr}" tz=${tz}`);
  return _task;
}

function scheduleJitter({ start, end, tz, base, account, headers }) {
  function scheduleAt(t, forTomorrow = false) {
    // Si forTomorrow = true, desplazamos 1 día. node-cron no permite fecha concreta,
    // pero nuestra guarda diaria impedirá dobles y reprogramamos el siguiente al disparar.
    const expr = `${t.min} ${t.h} * * *`;
    if (_task) _task.stop();
    _task = cron.schedule(
      expr,
      async () => {
        await fireOnceReel({ base, account, headers, tz });
        scheduleNext(); // programa la siguiente ventana aleatoria
      },
      { timezone: tz }
    );
    const tag = forTomorrow ? 'mañana' : 'hoy/mañana';
    console.log(`[IG Reel] jitter → próxima ${t.h.toString().padStart(2,'0')}:${t.min.toString().padStart(2,'0')} (${tz}) ${tag} expr="${expr}"`);
  }

  function scheduleNext() {
    const t = pickRandomTime({ start, end });
    const now = nowHM(tz);
    const state = readState(account);
    const today = todayStr(tz);

    // Regla: si reprogramas durante el día, fuerza la próxima para MAÑANA.
    // (También si ya se publicó hoy o si la hora elegida ya pasó.)
    const alreadyRanToday = state.lastRunDate === today;
    const pickedInPast = compareHM(t, now) <= 0;

    const forceTomorrow = true; // política segura: siempre mañana al reprogramar
    // Si prefieres matiz: const forceTomorrow = alreadyRanToday || pickedInPast;

    scheduleAt(t, forceTomorrow);
  }

  scheduleNext();
  return _task;
}

export function scheduleIGDailyReelJobAccount2() {
  const enabled = process.env.IG_SCHEDULER_ENABLED === 'true';
  if (!enabled) { console.log('[IG Reel] deshabilitado (IG_SCHEDULER_ENABLED != true)'); return null; }

  const mode = (process.env.IG_SCHEDULER_MODE || 'jitter').toLowerCase();
  const tz = 'Europe/Madrid';
  const base = process.env.API_URL || 'http://localhost:5050';
  const account = process.env.IG_ACCOUNT_ALIAS || 'keikodevfree';
  const headers = process.env.ADMIN_KEY ? { 'x-admin-key': process.env.ADMIN_KEY } : {};

  if (mode === 'fixed') {
    const expr = process.env.IG_CRON || '0 12 * * *';
    return scheduleFixed({ expr, tz, base, account, headers });
  }
  if (mode === 'off') { console.log('[IG Reel] modo off'); return null; }

  const start = parseHHMM(process.env.IG_WINDOW_START, { h: 12, min: 0 });
  const end   = parseHHMM(process.env.IG_WINDOW_END,   { h: 20, min: 30 });
  return scheduleJitter({ start, end, tz, base, account, headers });
}

export default scheduleIGDailyReelJobAccount2;
