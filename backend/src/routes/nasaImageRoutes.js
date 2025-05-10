import express from 'express';
import {
  getNasaImages,
  createNasaImage,
  updateNasaImage,
  deleteNasaImage,
  getLatestNasaImage
} from '../controllers/nasaImageController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getNasaImages);
router.post('/', protect, admin, createNasaImage);
router.put('/:id', protect, admin, updateNasaImage);
router.delete('/:id', protect, admin, deleteNasaImage);
router.get('/latest', getLatestNasaImage);

export default router;
