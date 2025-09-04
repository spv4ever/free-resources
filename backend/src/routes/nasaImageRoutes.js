import express from 'express';
import {
  getNasaImages,
  createNasaImage,
  updateNasaImage,
  deleteNasaImage,
  getLatestNasaImage,
  getLatestNasaVideo
} from '../controllers/nasaImageController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { downloadFromNasa } from '../controllers/nasaDownloadController.js';

const router = express.Router();

router.get('/', getNasaImages);
router.post('/', protect, admin, createNasaImage);
router.put('/:id', protect, admin, updateNasaImage);
router.delete('/:id', protect, admin, deleteNasaImage);
router.get('/latest', getLatestNasaImage);
router.get('/latestvideo', getLatestNasaVideo);
router.get('/download', downloadFromNasa);

export default router;
