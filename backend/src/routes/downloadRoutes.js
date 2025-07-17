import express from 'express';
import { handleDescarga, getHistorialUsuario } from '../controllers/downloadController.js';
import { listarArchivosTemporales, eliminarArchivosTemporales } from '../controllers/tempFilesController.js';
import authOptional from '../middlewares/authOptional.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { limitarDescargas } from '../middlewares/limiteDescargas.js';

const router = express.Router();

// 👇 Rutas ya existentes
router.post('/', authOptional, limitarDescargas, handleDescarga);
router.get('/historial', protect, getHistorialUsuario);

// 👇 Nuevas rutas para admin
router.get('/temp-files', protect, admin, listarArchivosTemporales);
router.delete('/temp-files', protect, admin, eliminarArchivosTemporales);

export default router;
