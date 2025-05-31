import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadYoutubeVideo } from '../controllers/youtubeUploadController.js';

const router = express.Router();

// Carpeta temporal para los vídeos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'temp_uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/upload', upload.single('video'), uploadYoutubeVideo);

export default router;
