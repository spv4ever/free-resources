import express from 'express';
import { generarImagen, obtenerImagen, obtenerImagenesDelUsuario, verificarImagen, servirImagenDesdeComfy } from '../controllers/fluxController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requiereTokens } from '../middlewares/tokenMiddleware.js';

const router = express.Router();


router.post('/generate', protect, requiereTokens, generarImagen);
router.get('/imagen/:id', protect, obtenerImagen);
router.get('/mis-imagenes', protect, obtenerImagenesDelUsuario);
router.get('/verificar/:id', protect, verificarImagen);
router.get('/image/:filename', protect, servirImagenDesdeComfy);

export default router;
