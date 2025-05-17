import express from 'express';
import {
  getAllLinks,
  createLink,
  updateLink,
  deleteLink,
  getAllLinksAdmin
  
} from '../controllers/affiliateLinkController.js';

import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Ruta pública: frontend puede mostrar los popups
router.get('/', getAllLinks);

// Rutas protegidas: solo accesibles por usuarios admin
router.post('/', protect, admin, createLink);
router.put('/:id', protect, admin, updateLink);
router.delete('/:id', protect, admin, deleteLink);
router.get('/admin', protect, admin, getAllLinksAdmin);

export default router;
