// src/routes/weeklyRoutes.js
import { Router } from 'express';
import InstagramAccount from '../models/InstagramAccount.js';
import Schedule from '../models/Schedule.js';

// 👇 importa helpers del planner y el runner
import {
  rebuildWeeklyForAccount,
  getRegistrySummary,          // <- añade esto en WeeklyPlanner.js como te pasé
} from '../jobs/WeeklyPlanner.js';

import { run as runAdapter } from '../jobs/adapters/runner.js';

const router = Router();

/** Salud del módulo + TZ del proceso */
router.get('/health', (req, res) => {
  return res.json({
    ok: true,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
});

/** Lista de cuentas (selector del frontend) */
router.get('/accounts', async (req, res) => {
  const rows = await InstagramAccount.find({ isEnabled: true })
    .select('_id alias timezone')
    .lean();
  return res.json(Array.isArray(rows) ? rows : []);
});

/** Leer schedule de una cuenta */
router.get('/schedule/:accountId', async (req, res) => {
  const doc = await Schedule.findOne({ accountId: req.params.accountId }).lean();
  if (!doc) return res.status(204).send(); // sin contenido
  return res.json(doc);
});

/** Guardar/actualizar schedule de una cuenta */
router.put('/schedule/:accountId', async (req, res) => {
  const { accountId } = req.params;
  const payload = {
    accountId,
    post: req.body?.post || {},
    carousel: req.body?.carousel || {},
    reel: req.body?.reel || {},
    source: 'weekly',
  };
  const doc = await Schedule.findOneAndUpdate({ accountId }, payload, {
    upsert: true,
    new: true,
  }).lean();
  return res.json(doc);
});

/** Rehidratar el planificador para la cuenta (necesario tras guardar cambios) */
router.post('/rebuild/:accountId', async (req, res) => {
  await rebuildWeeklyForAccount(req.params.accountId);
  return res.json({ ok: true });
});

/** 🔎 Diagnóstico: qué hay programado (cron expr, hora, DOW, TZ) */
router.get('/diagnose/:accountId', async (req, res) => {
  const acc = await InstagramAccount.findById(req.params.accountId).lean();
  if (!acc) return res.status(404).json({ error: 'account not found' });

  const sched = await Schedule.findOne({ accountId: req.params.accountId }).lean();
  const planned = getRegistrySummary
    ? (getRegistrySummary(req.params.accountId) || [])
    : []; // por si aún no exportas el helper

  const nowLocal = new Date().toLocaleString('es-ES', {
    timeZone: acc.timezone || 'Europe/Madrid',
  });

  return res.json({ account: acc, schedule: sched, planned, nowLocal });
});

/** ▶️ Forzar ejecución inmediata (para pruebas sin esperar) */
router.post('/run-now/:accountId', async (req, res) => {
  const acc = await InstagramAccount.findById(req.params.accountId).lean();
  if (!acc) return res.status(404).json({ error: 'account not found' });

  const { type = 'post' } = req.body || {};
  await runAdapter(type, {
    _id: acc._id,
    alias: acc.alias,
    igUserId: acc.igUserId,
    accessToken: acc.accessToken,
    timezone: acc.timezone || 'Europe/Madrid',
  });

  return res.json({ ok: true, ran: type, alias: acc.alias });
});

export default router;
