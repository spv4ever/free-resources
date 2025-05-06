
import axios from 'axios';
import YoutubeChannel from '../models/YoutubeChannel.js';
import { getLatestVideosFromChannel } from '../jobs/getChannelVideos.js';

export const getChannels = async (req, res) => {
  try {
    const channels = await YoutubeChannel.find();
    res.json(channels);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los canales' });
  }
};

export const addChannel = async (req, res) => {
    const { channelId } = req.body;
  
    if (!channelId) return res.status(400).json({ message: 'Falta channelId' });
  
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
  
      // Consulta los datos reales del canal
      const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
          part: 'snippet',
          id: channelId,
          key: apiKey
        }
      });
  
      const info = response.data.items[0]?.snippet;
      if (!info) return res.status(404).json({ message: 'Canal no encontrado en YouTube' });
  
      const newChannel = new YoutubeChannel({
        name: info.title,
        channelId,
        description: info.description,
        thumbnail: info.thumbnails?.default?.url
      });
  
      const saved = await newChannel.save();
      res.status(201).json(saved);
    } catch (error) {
      console.error('Error al guardar canal:', error.message);
      res.status(500).json({ message: 'Error al guardar canal' });
    }
  };

  export const getVideosByChannelMongoId = async (req, res) => {
    const mongoId = req.params.id;
  
    try {
      const canal = await YoutubeChannel.findById(mongoId);
      if (!canal) return res.status(404).json({ message: 'Canal no encontrado' });
  
      const videos = await getLatestVideosFromChannel(canal.channelId);
  
      res.json({
        channelName: canal.name,
        channelId: canal.channelId,   // 👈 aquí
        videos
      });
    } catch (error) {
      console.error('❌ Error al obtener videos del canal:', error.message);
      res.status(500).json({ message: 'Error al obtener videos' });
    }
  };