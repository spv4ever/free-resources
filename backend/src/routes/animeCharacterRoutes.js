import express from 'express';
import { updateTopFemaleCharacters, getAllCharacters  } from '../controllers/animeCharacterCtrl.js';

const router = express.Router();
router.post('/update-anilist', updateTopFemaleCharacters);
router.get('/all', getAllCharacters); // 👈 nueva ruta
export default router;
