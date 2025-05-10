import express from 'express';
import {
  getAiTools,
  createAiTool,
  updateAiTool,
  deleteAiTool,
  getAiToolStatsPerCategory 
} from '../controllers/aiToolController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Obtener todas las herramientas (público)
router.get('/', getAiTools);

// Crear una herramienta (solo admin)
router.post('/', protect, admin, createAiTool);

// Editar una herramienta (solo admin)
router.put('/:id', protect, admin, updateAiTool);

// Eliminar una herramienta (solo admin)
router.delete('/:id', protect, admin, deleteAiTool);

router.get('/stats/per-category', getAiToolStatsPerCategory);

export default router;
