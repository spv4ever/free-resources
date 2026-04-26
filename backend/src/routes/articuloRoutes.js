import express from 'express';
import { createArticulo, deleteArticulo, getArticulosAdmin, updateArticulo } from '../controllers/articuloController.js';
import { admin, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/admin', protect, admin, getArticulosAdmin);
router.post('/', protect, admin, createArticulo);
router.put('/:id', protect, admin, updateArticulo);
router.delete('/:id', protect, admin, deleteArticulo);

export default router;
