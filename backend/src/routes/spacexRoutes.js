
import express from 'express';
import { getSpacexLaunches, getSpacexHistory, getSpacexStats  } from '../controllers/spacexController.js';
import { getLaunchById } from '../controllers/spacexController.js';
import { getPendingEnrichCount } from '../controllers/spacexController.js';



const router = express.Router();

router.get('/next-launches', getSpacexLaunches);
router.get('/history', getSpacexHistory);
router.get('/stats', getSpacexStats);
router.get('/pending-enrich', getPendingEnrichCount);

router.get('/launch/:id', getLaunchById);


export default router;
