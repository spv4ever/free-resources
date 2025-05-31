import { uploadVideo } from '../services/youtubeService.js';
import fs from 'fs';
import path from 'path';

export const uploadYoutubeVideo = async (req, res) => {
  try {
    const { title, description, tags, scheduledTime, channelId  } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Falta el archivo de vídeo' });
    }

    const videoPath = req.file.path;

    const capitalizedTitle = title
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');


    const videoData = await uploadVideo({
      channelId, // ⬅️ esto es esencial
      videoPath,
      title: capitalizedTitle,
      description,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      scheduledTime
    });

    // Eliminar el archivo local después de subirlo
    fs.unlink(videoPath, (err) => {
      if (err) console.warn('No se pudo eliminar el archivo temporal:', err);
    });

    res.json({
      message: '✅ Video subido con éxito a YouTube',
      videoId: videoData.id,
      link: `https://youtu.be/${videoData.id}`
    });
  } catch (err) {
    console.error('❌ Error al subir video:', err);
    res.status(500).json({ error: 'Fallo al subir el video a YouTube' });
  }
};
