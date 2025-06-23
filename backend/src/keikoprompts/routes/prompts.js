import express from 'express';
import {
  getPromptsByPack,
  createPrompt,
  updatePrompt,
  deletePrompt,
  countPromptsByPack,
  countPromptsForOnePack,
  getPromptsByPackPaginated
} from '../controllers/promptController.js';

const router = express.Router();


// 👇 Primero las rutas más específicas
router.get('/by-pack-paginated/:packId', getPromptsByPackPaginated);

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

router.get('/by-pack-paginated/:packId', getPromptsByPackPaginated);

export default router;
