import express from 'express';
import {
  getAllLaunchesAdmin,
  updateWebcastManual,
  generateYoutubePost
} from '../controllers/spacexController.js';

const router = express.Router();

router.get('/spacex/all', getAllLaunchesAdmin);
router.put('/spacex/:id/webcast', updateWebcastManual);
router.post('/spacex/generate-post/:id', generateYoutubePost);

export default router;
