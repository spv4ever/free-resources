import express from 'express';
import { listYoutubeChannels } from '../controllers/youtubeTokenController.js';

const router = express.Router();

router.get('/channels', listYoutubeChannels);

export default router;
