// routes/promptUsageLogRoutes.js
import express from 'express';
import {
  logPromptUsage,
  getUserPromptUsage
} from '../controllers/promptUsageLogController.js';

const router = express.Router();

// POST /api/prompt-usage → Registrar uso
router.post('/', logPromptUsage);

// GET /api/prompt-usage/:userId → Obtener historial de uso por usuario
router.get('/:userId', getUserPromptUsage);

export default router;
