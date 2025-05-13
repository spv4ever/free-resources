// controllers/shortCategoryController.js
import ShortCategory from '../models/ShortCategory.js';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await ShortCategory.find();
    res.json(categories);
  } catch {
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { nombre, descripcion, activa, keywords, imageUrl, subcategoria } = req.body;
    const exists = await ShortCategory.findOne({ nombre });
    if (exists) return res.status(400).json({ message: 'Ya existe esa categoría' });

    const newCat = new ShortCategory({
      nombre,
      descripcion,
      activa,
      keywords,
      subcategoria,
      imageUrl
    });
    const saved = await newCat.save();
    res.status(201).json(saved);
  } catch {
    res.status(500).json({ message: 'Error al crear categoría' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    console.log('✏️ Actualizando con:', updateData); // <-- TEMPORAL
    const updated = await ShortCategory.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Error al actualizar categoría' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await ShortCategory.findByIdAndDelete(id);
    res.json({ message: 'Categoría eliminada' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar categoría' });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await ShortCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener la categoría' });
  }
};