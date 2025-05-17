import express from 'express';
import {
  getAllStyles,
  createStyle,
  updateStyle,
  deleteStyle,
  getAllAngles,
  createAngle,
  updateAngle,
  deleteAngle,
  getAllOutfits,
  createOutfit,
  updateOutfit,
  deleteOutfit,
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getAllPoses,
  createPose,
  updatePose,
  deletePose,
  getAllTags,
  createTag,
  updateTag,
  deleteTag
} from '../controllers/animePromptDataController.js';

const router = express.Router();

// 🎨 Styles
router.get('/styles', getAllStyles);
router.post('/styles', createStyle);
router.put('/styles/:id', updateStyle);
router.delete('/styles/:id', deleteStyle);

// 📸 Angles
router.get('/angles', getAllAngles);
router.post('/angles', createAngle);
router.put('/angles/:id', updateAngle);
router.delete('/angles/:id', deleteAngle);

// 👗 Outfits
router.get('/outfits', getAllOutfits);
router.post('/outfits', createOutfit);
router.put('/outfits/:id', updateOutfit);
router.delete('/outfits/:id', deleteOutfit);

// 📍 Locations
router.get('/locations', getAllLocations);
router.post('/locations', createLocation);
router.put('/locations/:id', updateLocation);
router.delete('/locations/:id', deleteLocation);

// 🧍‍♀️ Poses
router.get('/poses', getAllPoses);
router.post('/poses', createPose);
router.put('/poses/:id', updatePose);
router.delete('/poses/:id', deletePose);

// 🏷️ Tags
router.get('/tags', getAllTags);
router.post('/tags', createTag);
router.put('/tags/:id', updateTag);
router.delete('/tags/:id', deleteTag);

export default router;
