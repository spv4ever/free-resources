import express from 'express';
import { getYoutubeAuthUrl, handleYoutubeCallback } from '../controllers/youtubeAuthController.js';

const router = express.Router();

router.get('/auth/youtube', getYoutubeAuthUrl);
router.get('/auth/youtube/callback', handleYoutubeCallback);

export default router;
