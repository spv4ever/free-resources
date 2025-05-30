import express from 'express';
import anonymousRateLimiter from '../middlewares/anonymousRateLimiter.js';
import conditionalRateLimiter from '../middlewares/conditionalRateLimiter.js';
import { analyzeLink  } from '../controllers/linkAnalysisController.js';
import authOptional from '../middlewares/authOptional.js';
import { validateUrl } from '../middlewares/validateUrl.js';

const router = express.Router();

router.post('/analyze-link', authOptional, validateUrl, conditionalRateLimiter, analyzeLink );

export default router;
