
import express from 'express';
import { getSpacexLaunches, getSpacexHistory, getSpacexStats  } from '../controllers/spacexController.js';

const router = express.Router();

router.get('/next-launches', getSpacexLaunches);
router.get('/history', getSpacexHistory);
router.get('/stats', getSpacexStats);

export default router;
