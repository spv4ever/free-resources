import express from 'express';
import { detectAiText } from '../controllers/aiDetectorController.js';

const router = express.Router();

// Ruta POST para detectar texto IA
router.post('/detect-ai-hf', detectAiText);

export default router;
