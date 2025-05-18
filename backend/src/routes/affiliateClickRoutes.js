import express from 'express';
import { logClick } from '../controllers/affiliateClickController.js';
import { getClickStats } from '../controllers/affiliateClickController.js';


const router = express.Router();

router.post('/', logClick);
router.get('/stats', getClickStats);

export default router;
