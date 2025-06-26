// src/routes/imagenesPublicasRoutes.js
import express from 'express';
import { obtenerImagenesPublicas, obtenerImagenesPorPack } from '../controllers/imagenesPublicasController.js';

const router = express.Router();

router.get('/', obtenerImagenesPublicas);
router.get('/pack/:packId', obtenerImagenesPorPack);

export default router;
