import express from 'express';
import {
  getAllTrainingResources,
  createTrainingResource,
  updateTrainingResource,
  deleteTrainingResource
} from '../controllers/trainingResourceController.js';

import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllTrainingResources);
router.post('/', protect, admin, createTrainingResource);
router.put('/:id', protect, admin, updateTrainingResource);
router.delete('/:id', protect, admin, deleteTrainingResource);

export default router;
