import mongoose from 'mongoose';
import Category from './src/models/Category.js';  // Asegúrate de tener tu modelo Category importado
import dotenv from 'dotenv';
dotenv.config();

// Las categorías que deseas cargar
const categories = [
  { name: 'Plantillas para Camisetas', description: 'Recursos de diseño para personalizar camisetas' },
  { name: 'Diseños para Tazas', description: 'Diseños gráficos para personalizar tazas' },
  { name: 'Fondos de Escritorio', description: 'Imágenes para usar como fondos de pantalla de escritorios' },
  { name: 'Plantillas de Photoshop', description: 'Plantillas editables en Photoshop para distintos proyectos de diseño' },
  { name: 'Iconos y Logotipos', description: 'Iconos y logotipos vectoriales para usar en proyectos de diseño' },
  { name: 'Texturas y Patrones', description: 'Texturas y patrones para agregar efectos visuales a tus diseños' },
  { name: 'Pósters e Ilustraciones', description: 'Pósters e ilustraciones gráficas para decorar o personalizar proyectos' },
  { name: 'Carteles para Redes Sociales', description: 'Plantillas y recursos gráficos para crear carteles y publicaciones en redes sociales' },
  { name: 'Pack de Fuentes', description: 'Paquetes de fuentes tipográficas para mejorar tus diseños' },
  { name: 'Elementos de UI', description: 'Elementos gráficos de interfaz de usuario como botones, iconos, y otros componentes' },
  { name: 'Imágenes para Portadas', description: 'Imágenes y recursos para crear portadas de libros, revistas o redes sociales' },
  { name: 'Vectores de Gráficos', description: 'Archivos vectoriales para usar en proyectos de diseño gráfico' },
  { name: 'Archivos para Impresión', description: 'Archivos listos para ser impresos en distintos formatos' }
];

// Función para cargar las categorías en la base de datos
const loadCategories = async () => {
  try {
    // Conectar a MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Conectado a MongoDB Atlas');

    // Insertar las categorías
    const result = await Category.insertMany(categories);
    console.log('Categorías cargadas exitosamente:', result);

    // Cerrar la conexión
    mongoose.connection.close();
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
};

// Llamar la función para cargar las categorías
loadCategories();
