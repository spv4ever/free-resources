// routes/categoryRoutes.js
import { Router } from 'express';
import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect, admin } from '../middlewares/authMiddleware.js'; // Importamos los middlewares

const router = Router();

// Rutas de categoría
router.post('/', protect, admin, createCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

export default router;
