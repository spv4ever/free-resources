import express from 'express';
import multer from 'multer';
import { uploadImage, getUserImages  } from '../controllers/uploadController.js';
import { getUserImagesFromDB } from '../controllers/uploadController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Multer para recibir archivos del frontend
const storage = multer.diskStorage({});
const upload = multer({ storage });

router.post('/image', upload.single('image'), uploadImage);
router.get('/images/mias',protect , getUserImages);
router.get('/images/db', protect, getUserImagesFromDB);


export default router;
