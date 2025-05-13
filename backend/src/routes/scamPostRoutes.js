
import express from 'express';
import { generatePostsFromLatestEmail,
    getLatestScamPosts,
    getAllScamPosts,
    getScamPostById } from '../controllers/scamPostController.js';

const router = express.Router();

router.post('/process-pending', generatePostsFromLatestEmail);
router.get('/latest', getLatestScamPosts);
router.get('/all', getAllScamPosts); // ✅ NUEVO
router.get('/', getAllScamPosts); // ✅ NUEVO
router.get('/:id', getScamPostById); // 👈 nueva línea

export default router;
