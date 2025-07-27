import express from 'express';
import { registerClick } from '../controllers/trackingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/click', protect, registerClick);

export default router;
