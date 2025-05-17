import express from 'express';
import { generateRandomPrompt } from '../controllers/animePromptController.js';

const router = express.Router();

router.get('/random', generateRandomPrompt);

export default router;
