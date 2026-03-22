import express from 'express';
import {
  createModel,
  deleteModel,
  getAdminModels,
  getModelBySlug,
  getPublicModels,
  updateModel,
} from '../controllers/model3DController.js';
import { admin, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getPublicModels);
router.get('/admin', protect, admin, getAdminModels);
router.get('/slug/:slug', getModelBySlug);
router.post('/', protect, admin, createModel);
router.put('/:id', protect, admin, updateModel);
router.delete('/:id', protect, admin, deleteModel);

export default router;
