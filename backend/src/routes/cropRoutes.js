import express from "express";
import multer from "multer";
import { cropImage } from "../controllers/cropController.js";

const router = express.Router();
const upload = multer();

router.post("/crop-image", upload.single("image"), cropImage);

export default router;
