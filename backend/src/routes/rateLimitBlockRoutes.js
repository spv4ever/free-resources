import express from 'express';
import { getRateLimitBlocks } from '../controllers/rateLimitBlockController.js';

const router = express.Router();

router.get('/', getRateLimitBlocks);

export default router;
