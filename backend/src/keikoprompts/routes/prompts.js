import express from 'express';
import {
  getPromptsByPack,
  createPrompt,
  updatePrompt,
  deletePrompt,
  countPromptsByPack,
  countPromptsForOnePack,
  obtenerUltimaImagenGenerada,
  getPromptsByPackPaginated,
  obtenerImagenesDePrompt
} from '../controllers/promptController.js';

import { updateMultiplePlatforms } from '../controllers/promptController.js';

const router = express.Router();


// 👇 Primero las rutas más específicas
router.get('/by-pack-paginated/:packId', getPromptsByPackPaginated);

// Listar prompts de un pack
router.get('/by-pack/:packId', getPromptsByPack);

// Conteo de todos los packs
router.get('/count/by-pack', countPromptsByPack);

// Conteo de un pack concreto
router.get('/count/by-pack/:packId', countPromptsForOnePack);
router.put('/mass-update', updateMultiplePlatforms);
// CRUD de prompts
router.post('/', createPrompt);
router.put('/:id', updatePrompt);
router.delete('/:id', deletePrompt);

router.get('/by-pack-paginated/:packId', getPromptsByPackPaginated);

router.get('/ultima-imagen/:promptId', obtenerUltimaImagenGenerada);

router.get('/historial-imagenes/:promptId', obtenerImagenesDePrompt);

export default router;
