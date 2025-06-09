// routes/userPromptFavoriteRoutes.js
import express from 'express';
import {
  addFavorite,
  removeFavorite,
  getUserFavorites
} from '../controllers/userPromptFavoriteController.js';

const router = express.Router();

// GET /api/favorites/:userId → Obtener todos los favoritos del usuario
router.get('/:userId', getUserFavorites);

// POST /api/favorites → Añadir favorito (body: { userId, promptId })
router.post('/', addFavorite);

// DELETE /api/favorites → Quitar favorito (body: { userId, promptId })
router.delete('/', removeFavorite);

export default router;
