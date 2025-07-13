import express from "express";
import multer from "multer";
import { convertImagesBatch } from "../controllers/convertController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/convert-images", upload.array("images", 10), convertImagesBatch);

export default router;
