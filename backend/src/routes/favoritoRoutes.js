import express from 'express';
import { addFavorito, removeFavorito, getFavoritos } from '../controllers/favoritoController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, addFavorito);
router.delete('/:gifId', protect, removeFavorito);
router.get('/', protect, getFavoritos);

export default router;
