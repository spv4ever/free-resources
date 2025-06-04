// routes/userSeriesStatsRoutes.js
import express from 'express';
import { getUserSeriesStats, getGlobalSeriesStats  } from '../controllers/userSeriesStatsController.js';
import { getUserSeriesByStatus } from '../controllers/userSeriesFilterController.js';

const router = express.Router();
// Estadísticas generales del usuario
router.get('/series-user-stats/global', getGlobalSeriesStats);
router.get('/series-user-stats/:userId', getUserSeriesStats);
// Filtro de series por estado (favorites, completed, watching, to-start)
router.get('/user-series', getUserSeriesByStatus);


export default router;
