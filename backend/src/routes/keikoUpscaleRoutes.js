import express from 'express';
import multer from 'multer';
import { upscaleImage } from '../controllers/keikoUpscaleController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upscale', upload.single('image'), protect, upscaleImage);

export default router;
