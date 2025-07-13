import express from "express";
import multer from "multer";
import { resizeImagesBatch } from "../controllers/resizeController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/resize-images", upload.array("images", 10), resizeImagesBatch);

export default router;
