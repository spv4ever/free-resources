// src/routes/text2imageRoutes.js
import { Router } from 'express';
import { protect } from '../middlewares/auth.js'; // 👈 tu módulo de arriba
import checkAndDebitTokens from '../middlewares/checkAndDebitTokens.js';
import { iniciarTextoImagen, estadoTextoImagen } from '../controllers/text2imageController.js';

const router = Router();

// cost = 1 token por generación (ajústalo a tu gusto)
router.post('/text2img', protect, checkAndDebitTokens(1), iniciarTextoImagen);
router.get('/text2img/:id', protect, estadoTextoImagen);

export default router;
