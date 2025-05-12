import express from 'express';
import {
  getSocialPosts,
  generateSocialPost,
  updateSocialPostStatus,
  deleteDescartados
} from '../controllers/socialPostController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Solo accesible para admins autenticados
// router.use(protect);
// router.use(admin);

// GET: obtener todos los posts sociales generados
router.get('/', getSocialPosts);

// POST: generar un nuevo post social desde un recurso existente
router.post('/generate', generateSocialPost);

// PUT: actualizar el estado del post (publicado / descartado / pendiente)
router.put('/:id/status', updateSocialPostStatus);

router.delete('/descartados', deleteDescartados);

export default router;
