import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

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
      folder: 'recursos_free_resources'
    });

    // Borra el archivo temporal
    fs.unlinkSync(filePath);

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('❌ Error al subir imagen:', error);
    res.status(500).json({ error: 'Error al subir imagen a Cloudinary' });
  }
};
