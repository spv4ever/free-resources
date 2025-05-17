import AffiliateLink from '../models/AffiliateLink.js';

// Obtener todos los enlaces activos (filtro por página opcional)
const getAllLinks = async (req, res) => {
  try {
    const { page } = req.query;
    const filter = { isActive: true };
    if (page) filter.page = page;

    const links = await AffiliateLink.find(filter).sort({ priority: 1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los links' });
  }
};

const getAllLinksAdmin = async (req, res) => {
  try {
    const links = await AffiliateLink.find().sort({ priority: 1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los links (admin)' });
  }
};

// Crear nuevo enlace de afiliado
const createLink = async (req, res) => {
  try {
    const newLink = new AffiliateLink(req.body);
    const saved = await newLink.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear el link' });
  }
};

// Actualizar un enlace existente
const updateLink = async (req, res) => {
  try {
    const updated = await AffiliateLink.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el link' });
  }
};

// Eliminar un enlace por ID
const deleteLink = async (req, res) => {
  try {
    await AffiliateLink.findByIdAndDelete(req.params.id);
    res.json({ message: 'Link eliminado' });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar el link' });
  }
};

export {
  getAllLinks,
  getAllLinksAdmin,
  createLink,
  updateLink,
  deleteLink
};
