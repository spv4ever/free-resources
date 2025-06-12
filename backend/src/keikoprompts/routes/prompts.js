import express from 'express';
import {
  getPromptsByPack,
  createPrompt,
  updatePrompt,
  deletePrompt,
  countPromptsByPack,
  countPromptsForOnePack
} from '../controllers/promptController.js';

const router = express.Router();

// Listar prompts de un pack
router.get('/by-pack/:packId', getPromptsByPack);

// Conteo de todos los packs
router.get('/count/by-pack', countPromptsByPack);

// Conteo de un pack concreto
router.get('/count/by-pack/:packId', countPromptsForOnePack);

// CRUD de prompts
router.post('/', createPrompt);
router.put('/:id', updatePrompt);
router.delete('/:id', deletePrompt);

export default router;
