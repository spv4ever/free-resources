// routes/seriesCategoryRoutes.js
import express from 'express';
import {
  getAllCategories,
  getSeriesByCategory,
  createCategory
} from '../controllers/seriesCategoryController.js';

const router = express.Router();

// 🔹 GET /api/series/categories → todas las categorías con conteo
router.get('/', getAllCategories);

// 🔹 GET /api/series/categories/:slug → series por categoría
router.get('/:slug', getSeriesByCategory);

// 🔹 POST /api/series/categories → crear nueva categoría (panel admin)
router.post('/', createCategory);

export default router;
