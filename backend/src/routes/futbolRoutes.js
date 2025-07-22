import express from 'express';
import {
    syncTeams,
  syncStandings,
  getEquiposLaLiga,
  getClasificacionLaLiga
} from '../controllers/futbolController.js';

const router = express.Router();


// Sincronización desde API externa
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

router.get('/laliga/equipos', getEquiposLaLiga);
router.get('/laliga/clasificacion', getClasificacionLaLiga);

export default router;
