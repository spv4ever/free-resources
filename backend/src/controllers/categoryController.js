import Category from '../models/Category.js';

// Crear una nueva categoría
export const createCategory = async (req, res) => {
  const { name, description, imageUrl, parentCategory } = req.body;

  try {
    const category = new Category({
      name,
      description,
      imageUrl,
      parentCategory,
    });

    await category.save();
    res.status(201).json({ message: 'Categoría creada con éxito', category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear la categoría' });
  }
};

// Obtener todas las categorías
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('parentCategory');
    res.status(200).json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener las categorías' });
  }
};

// Obtener una categoría por su ID
export const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id).populate('parentCategory');
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.status(200).json({ category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener la categoría' });
  }
};

// Actualizar una categoría
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, imageUrl, parentCategory } = req.body;

  try {
    const category = await Category.findByIdAndUpdate(
      id,
      { name, description, imageUrl, parentCategory },
      { new: true } // Devuelve el documento actualizado
    );

    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.status(200).json({ message: 'Categoría actualizada con éxito', category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar la categoría' });
  }
};

// Eliminar una categoría
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.status(200).json({ message: 'Categoría eliminada con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar la categoría' });
  }
};


