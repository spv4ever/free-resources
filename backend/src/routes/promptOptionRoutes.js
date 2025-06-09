// routes/promptOptionRoutes.js
import express from 'express';
import {
  createPromptOption,
  getAllPromptOptions,
  updatePromptOption,
  deletePromptOption
} from '../controllers/promptOptionController.js';

const router = express.Router();

// GET /api/prompt-options?group=ID
router.get('/', getAllPromptOptions);

// POST /api/prompt-options
router.post('/', createPromptOption);

// PUT /api/prompt-options/:id
router.put('/:id', updatePromptOption);

// DELETE /api/prompt-options/:id
router.delete('/:id', deletePromptOption);

export default router;
