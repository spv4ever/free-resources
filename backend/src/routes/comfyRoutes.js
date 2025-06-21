import express from 'express';
import {
  getComfyUrlController,
  setComfyUrlController
} from '../controllers/comfyController.js';
import { getComfyJobStatus,getAllComfyJobs } from '../controllers/comfyStatusController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';



const router = express.Router();

// Acceso solo a usuarios autenticados (puedes añadir `admin` si lo prefieres)
router.get('/jobs', getAllComfyJobs); // 🆕 todos los jobs
router.get('/config/:key', protect, getComfyUrlController);
router.post('/config/:key', protect, admin, setComfyUrlController);
router.get('/status/:promptId', getComfyJobStatus);

export default router;
