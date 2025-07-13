import express from "express";
import multer from "multer";
import { pixelateImage } from "../controllers/pixelateController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/pixelate-image", upload.single("image"), pixelateImage);

export default router;
