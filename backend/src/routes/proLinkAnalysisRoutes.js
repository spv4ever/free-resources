import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getUserLinkHistory, deleteBulkUserLinkAnalyses, getOneUserLinkAnalysis } from '../controllers/linkAnalysisController.js';

const router = express.Router();

router.get('/link-analysis', protect, getUserLinkHistory);
router.post('/link-analysis/delete-bulk', protect, deleteBulkUserLinkAnalyses);
router.get('/link-analysis/:id', protect, getOneUserLinkAnalysis);

export default router;
