import BlogPost from "../models/BlogPost.js";

export const getAllPosts = async (req, res) => {
  const { page = 1, limit = 10, featured } = req.query;

  const query = {};
  if (featured === 'true') query.featured = true;
  if (featured === 'false') query.featured = false;

  try {
    const posts = await BlogPost.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await BlogPost.countDocuments(query);

    res.json({ posts, total });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los posts" });
  }
};

export const getFeaturedPosts = async (req, res) => {
  const posts = await BlogPost.find({ featured: true }).sort({ createdAt: -1 }).limit(5);
  res.json(posts);
};

export const getPostBySlug = async (req, res) => {
  const post = await BlogPost.findOne({ slug: req.params.slug });
  if (!post) return res.status(404).json({ error: "Post no encontrado" });
  res.json(post);
};

export const createPost = async (req, res) => {
  const { title, content, summary, coverImage, images, featured } = req.body;
  const baseSlug = title.toLowerCase().replace(/\s+/g, "-");
    let slug = baseSlug;
    let count = 1;

    while (await BlogPost.findOne({ slug })) {
    slug = `${baseSlug}-${count++}`;
    }
  const newPost = new BlogPost({ title, slug, content, summary, coverImage, images, featured });
  await newPost.save();
  res.status(201).json(newPost);
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  updates.updatedAt = new Date();

  try {
    const updatedPost = await BlogPost.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedPost) return res.status(404).json({ error: "Post no encontrado" });
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el post" });
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPost = await BlogPost.findByIdAndDelete(id);
    if (!deletedPost) return res.status(404).json({ error: "Post no encontrado" });
    res.json({ message: "Post eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar el post" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post no encontrado" });
    res.json(post);
  } catch (err) {
    return res.status(400).json({ error: "ID inválido" });
  }
};
