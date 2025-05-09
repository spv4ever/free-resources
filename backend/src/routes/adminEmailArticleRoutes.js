import express from 'express';
import {
  getEmailArticles,
  approveArticle,
  markArticleReviewed,
  generatePostsFromApprovedArticles // 👈 NUEVO
} from '../controllers/adminEmailArticleController.js';

const router = express.Router();

router.get('/', getEmailArticles);
router.patch('/:id/approve', approveArticle);
router.patch('/:id/review', markArticleReviewed);
router.post('/generate-posts', generatePostsFromApprovedArticles);

export default router;
