import express from 'express';
import { importPromptsFromJson } from '../controllers/importController.js';

const router = express.Router();

router.post('/', importPromptsFromJson);

export default router;
