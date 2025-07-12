import express from 'express';
import multer from 'multer';
import { upscaleImage } from '../controllers/keikoUpscaleController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { enviarUpscaleATelegram } from '../controllers/upscaleToTelegramController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/test-telegram', (req, res) => {
  res.json({ ok: true });
});

router.post('/upscale', upload.single('image'), protect, upscaleImage);
router.post('/to-telegram',upload.single('image'),protect, enviarUpscaleATelegram);



export default router;
