// routes/promptPackRoutes.js
import express from 'express';
import {
  createPromptPack,
  getAllPromptPacks,
  getPromptPackById,
  updatePromptPack,
  deletePromptPack
} from '../controllers/promptPackController.js';

const router = express.Router();

// GET /api/prompt-packs
router.get('/', getAllPromptPacks);

// GET /api/prompt-packs/:id
router.get('/:id', getPromptPackById);

// POST /api/prompt-packs
router.post('/', createPromptPack);

// PUT /api/prompt-packs/:id
router.put('/:id', updatePromptPack);

// DELETE /api/prompt-packs/:id
router.delete('/:id', deletePromptPack);

export default router;
