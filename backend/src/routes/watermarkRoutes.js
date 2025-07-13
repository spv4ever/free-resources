import express from "express";
import multer from "multer";
import { watermarkImagesBatch } from "../controllers/watermarkController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/watermark-images",
  upload.any(), // permite múltiples campos: images[] + watermarkImage
  watermarkImagesBatch
);

export default router;
