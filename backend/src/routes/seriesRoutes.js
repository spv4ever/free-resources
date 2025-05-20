import express from 'express';
import {
  searchSeries,
  importSeries,
  getSeriesDetails,
  getWeeklyTop,
  getAvailableWeeks,
  getSeriesWeeklyHistory,
  getTopHistoricalSeries
} from '../controllers/seriesController.js';
import { triggerWeeklyTopSync } from '../controllers/seriesController.js';


const router = express.Router();

router.get('/search', searchSeries);              // Buscar series por nombre
router.post('/import/:tmdbId', importSeries);     // Importar y guardar una serie
router.get('/top-weekly', getWeeklyTop); // Obtener el top semanal más reciente
router.get('/weeks', getAvailableWeeks);    // Obtener semanas disponibles
router.get('/:tmdbId/top-history', getSeriesWeeklyHistory); // Consultar el historial de una serie
router.get('/top-historical', getTopHistoricalSeries);
router.post('/sync-weekly-now', triggerWeeklyTopSync);
router.get('/:tmdbId', getSeriesDetails);         // Consultar detalles de una serie guardada


export default router;
