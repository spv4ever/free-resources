// controllers/seriesCategoryController.js
import SeriesCategory from '../models/SeriesCategory.js';
import Series from '../models/Series.js';

// 📥 Obtener todas las categorías con conteo de series
export const getAllCategories = async (req, res) => {
  try {
    const categories = await SeriesCategory.find();

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Series.countDocuments({ category: cat._id });
        return {
          _id: cat._id,
          nombre: cat.nombre,
          slug: cat.slug,
          imagen: cat.imagen,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt,
          count
        };
      })
    );

    res.json(categoriesWithCount);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener categorías', error: err.message });
  }
};

// 📥 Obtener series por slug de categoría
export const getSeriesByCategory = async (req, res) => {
  const { slug } = req.params;
  try {
    const category = await SeriesCategory.findOne({ slug });
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });

    const series = await Series.find({ category: category._id }).sort({ fetchedAt: -1 });
    res.json(series);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener series', error: err.message });
  }
};

// ✏️ Crear categoría manualmente (para panel admin)
export const createCategory = async (req, res) => {
  const { nombre, slug, imagen } = req.body;

  try {
    const existing = await SeriesCategory.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Ya existe una categoría con este slug' });
    }

    const category = new SeriesCategory({ nombre, slug, imagen });
    await category.save();

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear categoría', error: err.message });
  }
};
