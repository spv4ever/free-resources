import express from 'express';
import {
  getComfyUrlController,
  setComfyUrlController
} from '../controllers/comfyController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Acceso solo a usuarios autenticados (puedes añadir `admin` si lo prefieres)
router.get('/config/:key', protect, getComfyUrlController);
router.post('/config/:key', protect, admin, setComfyUrlController);

export default router;
