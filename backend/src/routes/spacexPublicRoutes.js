import express from 'express';
import {
  getSpacexLaunches,
  getSpacexHistory,
  getSpacexStats,
  getLaunchById,
  getPendingEnrichCount
} from '../controllers/spacexController.js';

const router = express.Router();

router.get('/next-launches', getSpacexLaunches);
router.get('/history', getSpacexHistory);
router.get('/stats', getSpacexStats);
router.get('/pending-enrich', getPendingEnrichCount);
router.get('/launch/:id', getLaunchById);

export default router;
