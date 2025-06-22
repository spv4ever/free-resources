import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import ImagenGenerada from '../models/ImagenGenerada.js';

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (req, res) => {
  try {
    const filePath = req.file.path;

    const result = await cloudinary.v2.uploader.upload(filePath, {
      folder: 'recursos_free_resources',
      width: 800,
      crop: 'limit',     // 🔒 mantiene aspecto ratio, no recorta
      quality: 'auto',   // 🧠 compresión inteligente
      overwrite: true,
      resource_type: 'image'
    });

    fs.unlinkSync(filePath); // elimina temporal local

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('❌ Error al subir imagen:', error);
    res.status(500).json({ error: 'Error al subir imagen a Cloudinary' });
  }
};

export const getUserImages = async (req, res) => {
  try {
    const nickname = req.user.nickname;
    const { cursor } = req.query;

    const result = await cloudinary.v2.api.resources({
      type: 'upload',
      prefix: `keikoprompts/${nickname}/`,
      max_results: 50,
      next_cursor: cursor || undefined,
      direction: 'desc'  // 🔽 más nuevas primero
    });

    const images = result.resources
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // 🔽 más nuevas primero
      .map(r => ({
        url: r.secure_url,
        createdAt: r.created_at,
        publicId: r.public_id,
      }));

    res.json({
      images,
      nextCursor: result.next_cursor || null
    });
  } catch (error) {
    console.error('❌ Error al recuperar imágenes del usuario:', error);
    res.status(500).json({ error: 'No se pudieron recuperar las imágenes del usuario' });
  }
};

export const getUserImagesFromDB = async (req, res) => {
  try {
    const userId = req.user._id;

    const images = await ImagenGenerada.find({
      user: userId,
      status: 'completada',
      finalUrl: { $exists: true, $ne: null }
    })
      .sort({ createdAt: -1 }) // Más recientes primero
      .limit(100)              // Puedes ajustar este límite según el plan de usuario
      .select('finalUrl createdAt prompt');

    const formatted = images.map(img => ({
      url: img.finalUrl,
      createdAt: img.createdAt,
      prompt: img.prompt
    }));

    res.json({
      images: formatted,
      nextCursor: null // listo para futura paginación
    });
  } catch (error) {
    console.error('❌ Error al cargar imágenes desde la base de datos:', error);
    res.status(500).json({ error: 'No se pudieron cargar las imágenes del usuario' });
  }
};



