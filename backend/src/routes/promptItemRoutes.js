// routes/promptItemRoutes.js
import express from 'express';
import {
  createPromptItem,
  getPromptItemsByPack,
  getPromptItemById,
  updatePromptItem,
  deletePromptItem
} from '../controllers/promptItemController.js';

const router = express.Router();

// GET /api/prompt-items/pack/:packId → Todos los prompts de un pack
router.get('/pack/:packId', getPromptItemsByPack);

// GET /api/prompt-items/:id → Obtener prompt por ID
router.get('/:id', getPromptItemById);

// POST /api/prompt-items → Crear nuevo prompt
router.post('/', createPromptItem);

// PUT /api/prompt-items/:id → Actualizar prompt
router.put('/:id', updatePromptItem);

// DELETE /api/prompt-items/:id → Eliminar prompt
router.delete('/:id', deletePromptItem);

export default router;
