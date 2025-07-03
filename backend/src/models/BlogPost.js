import mongoose from "mongoose";

const BlogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  content: { type: String, required: true }, // texto plano generado por IA
  summary: { type: String },
  coverImage: { type: String },
  images: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  featured: { type: Boolean, default: false }
});

export default mongoose.model("BlogPost", BlogPostSchema);
