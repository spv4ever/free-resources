import express from 'express';
import { getTopByDate } from '../controllers/topSeriesController.js';

const router = express.Router();

/**
 * @route GET /api/tops
 * @desc Obtener el top de series de un día y tipo específico
 * @queryParam type (string) - ejemplo: "general", "netflix", "disney+", etc. (default: "general")
 * @queryParam date (string) - formato ISO (YYYY-MM-DD), default: hoy
 */
router.get('/', getTopByDate);

export default router;
