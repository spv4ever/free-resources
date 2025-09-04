// src/routes/futbol.routes.js
import express from 'express';
import {
  syncTeams,
  syncStandings,
  getEquiposLaLiga,
  getClasificacionLaLiga,
  getEquiposChampions,
  getClasificacionChampions,
  getEquiposByCompetition,
  getClasificacionByCompetition
} from '../controllers/futbolController.js';

// 👇 importa las funciones que ya usas en los cron jobs
import { importarPartidos, importarGoleadores } from '../controllers/eventsController.js';

const router = express.Router();

// ---------------------------
// Sincronización desde API externa (YA TENÍAS ESTAS)
// ---------------------------
router.post('/equipos/sync', async (req, res) => {
  const { competitionCode, season } = req.body;
  try {
    const count = await syncTeams(competitionCode, season);
    res.json({ message: 'Equipos sincronizados', total: count });
  } catch (err) {
    res.status(500).json({ error: 'Error al sincronizar equipos' });
  }
});

router.post('/standings/sync', async (req, res) => {
  const { competitionCode, season } = req.body;
  try {
    const count = await syncStandings(competitionCode, season);
    res.json({ message: 'Clasificación actualizada', total: count });
  } catch (err) {
    res.status(500).json({ error: 'Error al sincronizar clasificación' });
  }
});

// ---------------------------
// NUEVO: Partidos y Goleadores
// ---------------------------

// POST /api/futbol/partidos/sync
// body: { competitionCode:'PD'|'CL', competitionName:'LaLiga'|'Champions League', season: 2025 }
router.post('/partidos/sync', async (req, res) => {
  try {
    const { competitionCode, competitionName, season } = req.body || {};
    if (!competitionCode || !competitionName || !season) {
      return res.status(400).json({ error: 'Faltan parámetros (competitionCode, competitionName, season)' });
    }
    await importarPartidos(competitionCode, competitionName, Number(season));
    return res.json({ ok: true, message: `Partidos importados: ${competitionName} ${season}` });
  } catch (err) {
    console.error('[futbol] partidos/sync error:', err);
    return res.status(500).json({ ok: false, error: err?.message || 'Error interno' });
  }
});

// POST /api/futbol/goleadores/sync
// body: { competitionCode, competitionName, season }
router.post('/goleadores/sync', async (req, res) => {
  try {
    const { competitionCode, competitionName, season } = req.body || {};
    if (!competitionCode || !competitionName || !season) {
      return res.status(400).json({ error: 'Faltan parámetros (competitionCode, competitionName, season)' });
    }

    // Tu función original esperaba (req,res), la envolvemos:
    await importarGoleadores(
      { body: { competitionCode, competitionName, season: Number(season) } },
      { json: () => {} }
    );

    return res.json({ ok: true, message: `Goleadores importados: ${competitionName} ${season}` });
  } catch (err) {
    console.error('[futbol] goleadores/sync error:', err);
    return res.status(500).json({ ok: false, error: err?.message || 'Error interno' });
  }
});

// ---------------------------
// Consultas (YA TENÍAS ESTAS)
// ---------------------------
router.get('/laliga/equipos', getEquiposLaLiga);
router.get('/laliga/clasificacion', getClasificacionLaLiga);

// Champions (nuevas, mismo formato de salida)
router.get('/champions/teams', getEquiposChampions);
router.get('/champions/standings', getClasificacionChampions);

// (Opcional) Endpoints genéricos por query:
router.get('/equipos', getEquiposByCompetition);            // ?season=2025&competition=PD|CL|LaLiga|Champions
router.get('/clasificacion', getClasificacionByCompetition); // ?season=2025&competition=...

export default router;
