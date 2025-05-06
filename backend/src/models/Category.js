import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Definimos el esquema para las categorías
const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  imageUrl: { type: String }, // Si deseas agregar una imagen representativa para la categoría
  parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' }, // En caso de categorías jerárquicas
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
