import express from 'express';
import { eliminarImagen } from '../controllers/imagenes.controller.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.delete('/:id', protect, admin, eliminarImagen); // 🔐 protegido por token + rol admin

export default router;
