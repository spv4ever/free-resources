import express from "express";
import multer from "multer";
import { rotateImagesBatch } from "../controllers/rotateController.js";

const router = express.Router();
const upload = multer();

router.post("/rotate-images", upload.fields([
        { name: "images", maxCount: 10 },
        { name: "angle", maxCount: 1 },
        ]), rotateImagesBatch);

export default router;
