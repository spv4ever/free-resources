import express from 'express';
import { importarPartidos, getProximosPartidos, getPartidosJornadaLaLiga, importarGoleadores, getGoleadores, getJornadasLaLigaDisponibles,

  // ⬇️ NUEVOS WRAPPERS (los crearás en el controller)
  getMatchesChampions,
  getJornadasChampionsDisponibles,
  getPartidosJornadaChampions } from '../controllers/eventsController.js';

const router = express.Router();

// Actualiza partidos de La Liga
router.post('/actualizar/laliga', async (req, res) => {
  try {
    const season = req.body.season || 2025;
    const resultado = await importarPartidos('PD', 'LaLiga', season);
    res.json({ status: 'ok', competition: 'LaLiga', ...resultado });
  } catch (error) {
    console.error('Error actualizando LaLiga:', error);
    res.status(500).json({ error: 'Error al actualizar LaLiga' });
  }
});

// Actualiza partidos de la Champions League
router.post('/actualizar/champions', async (req, res) => {
  try {
    const season = req.body.season || 2025;
    const resultado = await importarPartidos('CL', 'Champions League', season);
    res.json({ status: 'ok', competition: 'Champions League', ...resultado });
  } catch (error) {
    console.error('Error actualizando Champions:', error);
    res.status(500).json({ error: 'Error al actualizar Champions' });
  }
});

router.post('/goleadores/importar', importarGoleadores);
router.get('/partidos/proximos', getProximosPartidos);
router.get('/goleadores/:competition', getGoleadores);



router.get('/partidos/laliga/jornadas', getJornadasLaLigaDisponibles);
router.get('/partidos/laliga/jornada/auto', getPartidosJornadaLaLiga);
router.get('/partidos/laliga/jornada/:jornada', getPartidosJornadaLaLiga);
// Obtener partidos por jornada de LaLiga
// -------------------- Champions (NUEVOS) --------------------
// Lista de jornadas disponibles para Champions
router.get('/partidos/champions/jornadas', getJornadasChampionsDisponibles);

// Jornada “auto” (la que toque ahora) para Champions
router.get('/partidos/champions/jornada/auto', getPartidosJornadaChampions);

// Jornada concreta para Champions
router.get('/partidos/champions/jornada/:jornada', getPartidosJornadaChampions);

// Nuevo endpoint unificado (grupos + eliminatorias)
router.get('/partidos/champions/matches', getMatchesChampions);


export default router;
