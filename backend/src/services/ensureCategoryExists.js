// services/ensureCategoryExists.js
import SeriesCategory from '../models/SeriesCategory.js';

export const ensureCategoryExists = async (genreName) => {
  if (!genreName || typeof genreName !== 'string') return null;

  const slug = genreName.toLowerCase().replace(/\s+/g, '-');

  let category = await SeriesCategory.findOne({ slug });

  if (!category) {
    category = new SeriesCategory({
      nombre: genreName,
      slug,
      imagen: '' // puedes asignar una imagen por defecto más adelante si lo deseas
    });

    await category.save();
  }

  return category._id;
};
