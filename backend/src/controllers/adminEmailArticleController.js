import EmailArticleEntry from '../models/EmailArticleEntry.js';
import { processAllApprovedArticles } from '../services/processArticleToPost.js'; // 👈 importa aquí

// GET artículos por revisar o aprobados
export const getEmailArticles = async (req, res) => {
  try {
    const filter = {};
    if (req.query.reviewed === 'false') filter.reviewed = false;
    if (req.query.approved === 'true') filter.approvedForPost = true;

    const articles = await EmailArticleEntry.find(filter).sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener artículos', error: err.message });
  }
};

// PATCH para aprobar o rechazar
export const approveArticle = async (req, res) => {
  try {
    const { approve } = req.body;
    const updated = await EmailArticleEntry.findByIdAndUpdate(
      req.params.id,
      { reviewed: true, approvedForPost: approve },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar artículo', error: err.message });
  }
};

// PATCH para solo marcar como revisado (rechazo sin aprobar)
export const markArticleReviewed = async (req, res) => {
  try {
    const updated = await EmailArticleEntry.findByIdAndUpdate(
      req.params.id,
      { reviewed: true },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error al marcar como revisado', error: err.message });
  }
};

export const generatePostsFromApprovedArticles = async (req, res) => {
    try {
      const result = await processAllApprovedArticles();
      res.json({ ok: true, created: result.length });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  };