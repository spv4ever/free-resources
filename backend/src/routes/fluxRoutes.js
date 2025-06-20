import express from 'express';
import { generarImagen, obtenerImagen, obtenerImagenesDelUsuario, verificarImagen } from '../controllers/fluxController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generarImagen);
router.get('/imagen/:id', protect, obtenerImagen);
router.get('/mis-imagenes', protect, obtenerImagenesDelUsuario);
router.get('/verificar/:id', protect, verificarImagen);

export default router;
