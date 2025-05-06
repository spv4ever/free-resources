import express from 'express';
import { getChannels, addChannel, getVideosByChannelMongoId } from '../controllers/youtubeChannelController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getChannels);
router.post('/', protect, admin, addChannel);
router.get('/:id/videos', getVideosByChannelMongoId);

export default router;
