// routes/favoriteRoutes.js
import express from 'express';
import { getLatestFavorites } from '../controllers/favoriteController.js';

const router = express.Router();

router.get('/latest', getLatestFavorites);

export default router;
