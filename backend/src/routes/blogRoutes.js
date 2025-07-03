import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  getAllPosts,
  getFeaturedPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost
} from "../controllers/blogController.js";

import { getPostById } from "../controllers/blogController.js";

const router = express.Router();

router.get("/", getAllPosts);
router.get("/featured", getFeaturedPosts);
router.get("/id/:id", getPostById);
router.get("/:slug", getPostBySlug);

// Rutas protegidas
router.post("/", protect, admin, createPost);
router.put("/:id", protect, admin, updatePost);
router.delete("/:id", protect, admin, deletePost);


export default router;
