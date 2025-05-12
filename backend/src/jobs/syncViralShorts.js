import axios from 'axios';
import dotenv from 'dotenv';
import ShortCategory from '../models/ShortCategory.js';
import ViralShort from '../models/ViralShort.js';

dotenv.config();

const YT_SEARCH_API = 'https://www.googleapis.com/youtube/v3/search';
const YT_VIDEOS_API = 'https://www.googleapis.com/youtube/v3/videos';
const MAX_RESULTS = 30;

const getYesterdayISO = () => {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return now.toISOString();
};

const getLastMonthISO = () => {
    const now = new Date();
    now.setDate(now.getDate() -   5); // 30 días atrás
    return now.toISOString();
  };

export const syncViralShorts = async () => {
  try {
    const categories = await ShortCategory.find();
    

     // 🔥 Limpiar toda la colección antes de comenzar
     await ViralShort.deleteMany({});
    

    for (const cat of categories) {
        console.log(`🔍 Procesando categoría: ${cat.nombre} (${cat.keywords})`);
        await ViralShort.deleteMany({ category: cat._id });

        if (!cat.keywords || cat.keywords.trim() === '') {
            console.warn(`⚠️ Categoría "${cat.nombre}" sin keywords. Se omite.`);
            continue;
        }
      

      const queryText = `${cat.keywords}`;

      const searchResponse = await axios.get(YT_SEARCH_API, {
        params: {
          part: 'snippet',
          q: queryText,
          type: 'video',
          maxResults: MAX_RESULTS,
          order: 'viewCount',
          publishedAfter: getLastMonthISO(),
          key: process.env.YOUTUBE_API_KEY,
          relevanceLanguage: 'es',
        },
      });

      const videoItems = searchResponse.data.items;
      const videoIds = videoItems.map((v) => v.id.videoId).filter(Boolean);

      if (!videoIds.length) continue;

      const detailsResponse = await axios.get(YT_VIDEOS_API, {
        params: {
          part: 'snippet,statistics,status',
          id: videoIds.join(','),
          key: process.env.YOUTUBE_API_KEY,
        },
      });
      let countValid = 0;
      let countDiscarded = 0;
      for (const video of detailsResponse.data.items) {
        if (!video.statistics?.viewCount) continue;

        if (!video.status?.embeddable) {
            console.warn(`⛔️ No embebible según status: ${video.id} (${video.snippet.title})`);
            countDiscarded++;
            continue;
          }

        const newShort = new ViralShort({
          videoId: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          channelTitle: video.snippet.channelTitle,
          thumbnail: video.snippet.thumbnails?.high?.url,
          publishedAt: video.snippet.publishedAt,
          views: parseInt(video.statistics.viewCount || 0, 10),
          likes: parseInt(video.statistics.likeCount || 0, 10),
          category: cat._id,
        });

        await newShort.save();
        console.log(`✅ Guardado: ${video.id} (${video.snippet.title})`);
        countValid++;
      }

      console.log(`✅ Categoría "${cat.nombre}" sincronizada.`);
    }

    console.log('🚀 Sincronización completa');
  } catch (err) {
    console.error('❌ Error en la sincronización de shorts virales:', err.message);
  }
};

export const syncSingleCategory = async (categoryId) => {
    try {
      const cat = await ShortCategory.findById(categoryId);
      if (!cat) throw new Error('Categoría no encontrada');
  
      console.log(`🔍 Procesando categoría: ${cat.nombre} (${cat.keywords})`);
  
      // Eliminar shorts anteriores de esa categoría
      await ViralShort.deleteMany({ category: cat._id });
  
      if (!cat.keywords || cat.keywords.trim() === '') {
        console.warn(`⚠️ Categoría "${cat.nombre}" sin keywords. Se omite.`);
        return;
      }
  
      const queryText = cat.keywords;
  
      const searchResponse = await axios.get(YT_SEARCH_API, {
        params: {
          part: 'snippet',
          q: queryText,
          type: 'video',
          maxResults: MAX_RESULTS,
          order: 'viewCount',
          publishedAfter: getLastMonthISO(),
          key: process.env.YOUTUBE_API_KEY,
          relevanceLanguage: 'es',
        },
      });
  
      const videoItems = searchResponse.data.items;
      const videoIds = videoItems.map((v) => v.id.videoId).filter(Boolean);
      if (!videoIds.length) return;
  
      const detailsResponse = await axios.get(YT_VIDEOS_API, {
        params: {
          part: 'snippet,statistics,status',
          id: videoIds.join(','),
          key: process.env.YOUTUBE_API_KEY,
        },
      });
  
      let countValid = 0;
      let countDiscarded = 0;
  
      for (const video of detailsResponse.data.items) {
        if (!video.statistics?.viewCount) continue;
  
        if (!video.status?.embeddable) {
          console.warn(`⛔️ No embebible: ${video.id} (${video.snippet.title})`);
          countDiscarded++;
          continue;
        }
  
        const newShort = new ViralShort({
          videoId: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          channelTitle: video.snippet.channelTitle,
          thumbnail: video.snippet.thumbnails?.high?.url,
          publishedAt: video.snippet.publishedAt,
          views: parseInt(video.statistics.viewCount || 0, 10),
          likes: parseInt(video.statistics.likeCount || 0, 10),
          category: cat._id,
        });
  
        await newShort.save();
        console.log(`✅ Guardado: ${video.id} (${video.snippet.title})`);
        countValid++;
      }
  
      console.log(`✔️ Total guardados: ${countValid}, descartados: ${countDiscarded}`);
      console.log(`✅ Categoría "${cat.nombre}" sincronizada.`);
  
    } catch (err) {
      console.error('❌ Error al sincronizar categoría específica:', err.message);
      throw err;
    }
  };