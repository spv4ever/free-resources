// routes/promptOptionGroupRoutes.js
import express from 'express';
import {
  createOptionGroup,
  getAllOptionGroups,
  updateOptionGroup,
  deleteOptionGroup
} from '../controllers/promptOptionGroupController.js';

const router = express.Router();

// GET /api/option-groups
router.get('/', getAllOptionGroups);

// POST /api/option-groups
router.post('/', createOptionGroup);

// PUT /api/option-groups/:id
router.put('/:id', updateOptionGroup);

// DELETE /api/option-groups/:id
router.delete('/:id', deleteOptionGroup);

export default router;
