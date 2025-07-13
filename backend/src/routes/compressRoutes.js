import express from "express";
import multer from "multer";
import { compressImagesBatch } from "../controllers/compressController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/compress-images", upload.array("images", 10), compressImagesBatch);

export default router;
