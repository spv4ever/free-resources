// backend/routes/keikoRemoveBGRoutes.js
import express from 'express';
import multer from 'multer';
import { removeBackground } from '../controllers/keikoRemoveBGController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Configurar multer para guardar archivos en memoria (buffer)
const upload = multer({ storage: multer.memoryStorage() });

// Ruta POST /remove-bg que recibe un archivo llamado 'image' y llama al controlador
router.post('/remove-bg', upload.single('image'), protect, removeBackground);

export default router;
