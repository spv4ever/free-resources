// src/services/cloudinaryUploadBuffer.js
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function uploadBufferToCloudinary(buffer, {
  folder = 'recursos_free_resources/texto-a-imagen', // mismo “namespace” que usas
  public_id,
  transformations = { width: 800, crop: 'limit', quality: 'auto' } // coherente con tu controller
} = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      { folder, public_id, overwrite: true, resource_type: 'image', ...transformations },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}
