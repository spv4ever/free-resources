import express from 'express';
import {
  createFilament,
  deleteFilament,
  getAdminFilaments,
  getFilamentBySlug,
  getPublicFilaments,
  updateFilament,
} from '../controllers/filamentController.js';
import { admin, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getPublicFilaments);
router.get('/admin', protect, admin, getAdminFilaments);
router.get('/slug/:slug', getFilamentBySlug);
router.post('/', protect, admin, createFilament);
router.put('/:id', protect, admin, updateFilament);
router.delete('/:id', protect, admin, deleteFilament);

export default router;
