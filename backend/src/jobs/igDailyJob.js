// backend/src/jobs/igDailyJob.js
import cron from 'node-cron';

// ------- Utilidades -------
function parseHHMM(s, def) {
  if (!s) return def;
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return def;
  let h = Math.max(0, Math.min(23, parseInt(m[1], 10)));
  let min = Math.max(0, Math.min(59, parseInt(m[2], 10)));
  return { h, min };
}

function pickRandomTime({ start, end }) {
  const a = start.h * 60 + start.min;
  const b = end.h * 60 + end.min;
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const pick = lo + Math.floor(Math.random() * (hi - lo + 1));
  return { h: Math.floor(pick / 60), min: pick % 60 };
}

async function fireOnce({ base, account, headers }) {
  try {
    let res = await fetch(`${base}/api/instagram/publish-one`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ account })
    });
    if (res.status === 405) {
      res = await fetch(`${base}/api/instagram/publish-one?account=${encodeURIComponent(account)}`, { method: 'GET', headers });
    }
    const text = await res.text();
    let payload = null; try { payload = text ? JSON.parse(text) : null; } catch {}
    console.log(`[IG Scheduler] ${new Date().toISOString()} status=${res.status} postId=${payload?.publishedId ?? 'N/A'} usedUrl=${payload?.usedUrl ?? 'N/A'} body=${text.slice(0,200)}`);
  } catch (e) {
    console.error('[IG Scheduler] ERROR', e.message);
  }
}

// ------- Schedulers -------
let _task = null;

function scheduleFixed({ expr, tz, base, account, headers }) {
  if (_task) _task.stop();
  _task = cron.schedule(expr, () => fireOnce({ base, account, headers }), { timezone: tz });
  console.log(`[IG Scheduler] Modo fixed → expr="${expr}" tz=${tz}`);
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
        await fireOnce({ base, account, headers });
        // Programa la siguiente del día siguiente (nueva hora aleatoria)
        scheduleNext();
      },
      { timezone: tz }
    );
    console.log(
      `[IG Scheduler] Modo jitter → próxima ${t.h.toString().padStart(2, '0')}:${t.min
        .toString()
        .padStart(2, '0')} (${tz}) expr="${expr}"`
    );
  }
  scheduleNext();
  return _task;
}

// ------- Export principal -------
export function scheduleIGDailyJob() {
  const enabled = process.env.IG_SCHEDULER_ENABLED === 'true';
  if (!enabled) {
    console.log('[IG Scheduler] deshabilitado (IG_SCHEDULER_ENABLED != true)');
    return null;
  }

  const mode = (process.env.IG_SCHEDULER_MODE || 'jitter').toLowerCase(); // 'jitter' | 'fixed' | 'off'
  const tz = 'Europe/Madrid';
  const base = process.env.API_URL || 'http://localhost:5050';
  const account = process.env.IG_ACCOUNT_ALIAS || 'account2';
  const headers = process.env.ADMIN_KEY ? { 'x-admin-key': process.env.ADMIN_KEY } : {};

  if (mode === 'fixed') {
    const expr = process.env.IG_CRON || '0 12 * * *'; // 12:00 por defecto
    return scheduleFixed({ expr, tz, base, account, headers });
  }
  if (mode === 'off') {
    console.log('[IG Scheduler] modo off: no se programa nada');
    return null;
  }

  // jitter por defecto: 12:00–20:30
  const start = parseHHMM(process.env.IG_WINDOW_START, { h: 12, min: 0 });
  const end = parseHHMM(process.env.IG_WINDOW_END, { h: 20, min: 30 });
  return scheduleJitter({ start, end, tz, base, account, headers });
}

export default scheduleIGDailyJob;
