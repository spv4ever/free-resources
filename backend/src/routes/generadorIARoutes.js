import express from 'express';
import {
  getGenerador,
  clickManual,
  aplicarMejora,
  reiniciarGenerador
} from '../controllers/generadorIAController.js';

import { protect } from '../middlewares/authMiddleware.js'; // asegúrate de tener este middleware

const router = express.Router();

router.get('/', protect, getGenerador);
router.post('/click', protect, clickManual);
router.post('/upgrade', protect, aplicarMejora);
router.post('/reiniciar', protect, reiniciarGenerador);

export default router;
