// backend/src/jobs/igDailyCarouselJob.account2.js
import cron from 'node-cron';

// --- helpers iguales a tu igDailyJob.js ---
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

// --- solo cambia el endpoint a /publish-carousel-one ---
async function fireOnceCarousel({ base, account, headers }) {
  try {
    let res = await fetch(`${base}/api/instagram/publish-carousel-one`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ account }) // por si lo usas en el controller
    });
    if (res.status === 405) {
      res = await fetch(
        `${base}/api/instagram/publish-carousel-one?account=${encodeURIComponent(account)}`,
        { method: 'GET', headers }
      );
    }
    const text = await res.text();
    console.log(`[IG Carousel] ${new Date().toISOString()} status=${res.status} body=${text}`);
  } catch (e) {
    console.error('[IG Carousel] ERROR', e.message);
  }
}

let _task = null;
function scheduleFixed({ expr, tz, base, account, headers }) {
  if (_task) _task.stop();
  _task = cron.schedule(expr, () => fireOnceCarousel({ base, account, headers }), { timezone: tz });
  console.log(`[IG Carousel] fixed → expr="${expr}" tz=${tz}`);
  return _task;
}
function scheduleJitter({ start, end, tz, base, account, headers }) {
  async function scheduleNext() {
    const t = pickRandomTime({ start, end });
    const expr = `${t.min} ${t.h} * * *`;
    if (_task) _task.stop();
    _task = cron.schedule(
      expr,
      async () => {
        await fireOnceCarousel({ base, account, headers });
        scheduleNext();
      },
      { timezone: tz }
    );
    console.log(`[IG Carousel] jitter → próxima ${t.h.toString().padStart(2,'0')}:${t.min.toString().padStart(2,'0')} (${tz}) expr="${expr}"`);
  }
  scheduleNext();
  return _task;
}

// Export principal (idéntico a tu igDailyJob.js, pero independiente)
export function scheduleIGDailyCarouselJobAccount2() {
  const enabled = process.env.IG_SCHEDULER_ENABLED === 'true';
  if (!enabled) {
    console.log('[IG Carousel] deshabilitado (IG_SCHEDULER_ENABLED != true)');
    return null;
  }

  const mode = (process.env.IG_SCHEDULER_MODE || 'jitter').toLowerCase();
  const tz = 'Europe/Madrid';
  const base = process.env.API_URL || 'http://localhost:5050';
  const account = process.env.IG_ACCOUNT_ALIAS || 'keikodevfree';
  const headers = process.env.ADMIN_KEY ? { 'x-admin-key': process.env.ADMIN_KEY } : {};

  if (mode === 'fixed') {
    const expr = process.env.IG_CRON || '0 12 * * *';
    return scheduleFixed({ expr, tz, base, account, headers });
  }
  if (mode === 'off') {
    console.log('[IG Carousel] modo off: no se programa nada');
    return null;
  }

  const start = parseHHMM(process.env.IG_WINDOW_START, { h: 12, min: 0 });
  const end   = parseHHMM(process.env.IG_WINDOW_END,   { h: 20, min: 30 });
  return scheduleJitter({ start, end, tz, base, account, headers });
}

export default scheduleIGDailyCarouselJobAccount2;
