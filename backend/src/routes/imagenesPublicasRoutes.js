// src/routes/imagenesPublicasRoutes.js
import express from 'express';
import { obtenerImagenesPublicas } from '../controllers/imagenesPublicasController.js';

const router = express.Router();

router.get('/', obtenerImagenesPublicas);

export default router;
