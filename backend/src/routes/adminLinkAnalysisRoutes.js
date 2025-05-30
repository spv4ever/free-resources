import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { isProOrAdmin } from '../middlewares/authMiddleware.js';
import { getAllLinkAnalyses, deleteLinkAnalysis, deleteBulkLinkAnalyses } from '../controllers/adminLinkAnalysisController.js';
import { analyzeLinkWithAI } from '../controllers/linkAnalysisController.js';

const router = express.Router();

router.get('/link-analysis', protect, admin, getAllLinkAnalyses);
router.delete('/link-analysis/:id', protect, admin, deleteLinkAnalysis);
router.post('/link-analysis/delete-bulk', protect, admin, deleteBulkLinkAnalyses);
// Endpoint solo para PRO y ADMIN
router.post('/link-analysis/:id/ai-analysis', protect, isProOrAdmin, analyzeLinkWithAI);

export default router;
