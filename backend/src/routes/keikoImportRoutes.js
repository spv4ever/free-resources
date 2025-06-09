// routes/keikoImportRoutes.js
import express from 'express';
import { importKeikoFromJson, importKeikoPreviewFromJson } from '../controllers/keikoImportController.js';
import { admin, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/import-preview', protect, admin, importKeikoPreviewFromJson);
router.post('/import-confirmed', protect, admin, importKeikoFromJson); // renombrar si deseas


export default router;
