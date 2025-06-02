import express from 'express';
import {
  addFavoriteSeries,
  removeFavoriteSeries,
  getUserFavorites,
  markEpisodeSeen,
  markSeasonSeen,
  markSeriesComplete,
  checkIfFavorite,
  getFavoriteSeriesDetails,
  unmarkEpisodeSeen,
  unmarkSeriesComplete,
  unmarkSeasonSeen

} from '../controllers/userFavoriteSeriesController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getUserFavorites);
router.post('/:seriesId', protect, addFavoriteSeries);
router.delete('/:seriesId', protect, removeFavoriteSeries);
router.post('/:seriesId/mark-episode', protect, markEpisodeSeen);
router.post('/:seriesId/mark-season/:seasonNumber', protect, markSeasonSeen);
router.post('/:seriesId/mark-complete', protect, markSeriesComplete);
router.get('/:seriesId/check', protect, checkIfFavorite);
router.get('/:seriesId/full', protect, getFavoriteSeriesDetails);
router.post('/:id/unmark-episode', protect, unmarkEpisodeSeen);
router.post('/:id/unmark-complete', protect, unmarkSeriesComplete);
router.post('/:id/unmark-season/:season', protect, unmarkSeasonSeen);



export default router;
