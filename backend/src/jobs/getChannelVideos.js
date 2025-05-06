import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.YOUTUBE_API_KEY;

export const getLatestVideosFromChannel = async (channelId, maxResults = 20) => {
  try {
    // 1. Obtener ID de uploads (playlist del canal)
    const channelRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'contentDetails',
        id: channelId,
        key: API_KEY
      }
    });

    const uploadsId = channelRes.data.items[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsId) throw new Error('No se encontró la playlist de subidas del canal');

    // 2. Obtener los últimos videos de esa playlist
    const playlistRes = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
      params: {
        part: 'snippet',
        playlistId: uploadsId,
        maxResults,
        key: API_KEY
      }
    });

    // 3. Formatear los datos
    const videos = playlistRes.data.items.map(item => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails?.medium?.url,
    }));

    return videos;
  } catch (err) {
    console.error('❌ Error al obtener videos del canal:', err.message);
    return [];
  }
};
