// src/routes/packRoutes.js

import express from 'express';
import {
  getAllPacks,
  getPackById,    // <-- nuevo
  createPack,
  updatePack,
  deletePack
} from '../controllers/packController.js';
import { getPromptCountsByCategory } from '../controllers/packController.js';

const router = express.Router();

router.get('/',      getAllPacks);
router.get('/categories-summary', getPromptCountsByCategory);
router.get('/:id',   getPackById);    // <-- ruta para GET /api/keiko/packs/:id
router.post('/',     createPack);
router.put('/:id',   updatePack);
router.delete('/:id',deletePack);


export default router;
