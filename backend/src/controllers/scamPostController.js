
import CyberScamPost from '../models/CyberScamPost.js';
import { processLatestPendingEmail } from '../services/processEmailToPost.js';

export async function generatePostsFromLatestEmail(req, res) {
  try {
    const posts = await processLatestPendingEmail();

    if (!posts || posts.length === 0) {
      return res.status(200).json({ message: 'No hay noticias nuevas para procesar.' });
    }

    res.json({
      message: `Se generaron ${posts.length} noticias a partir del último correo.`,
      total: posts.length,
      postIds: posts.map(p => p._id),
    });
  } catch (err) {
    console.error('❌ Error al generar posts:', err.message);
    res.status(500).json({ error: 'Error al procesar el correo.' });
  }
}

export async function getLatestScamPosts(req, res) {
  try {
    const latestPosts = await CyberScamPost.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('resumen _id createdAt');

    res.json(latestPosts);
  } catch (error) {
    console.error('❌ Error al obtener las últimas noticias:', error.message);
    res.status(500).json({ error: 'Error al cargar las noticias' });
  }
}

export async function getAllScamPosts(req, res) {
  try {
    const allPosts = await CyberScamPost.find({ titulo: { $ne: '' } }).sort({ createdAt: -1 });

    res.json(allPosts);
  } catch (error) {
    console.error('❌ Error al obtener todos los posts:', error.message);
    res.status(500).json({ error: 'Error al cargar las noticias completas' });
  }
}

// Obtener una noticia individual por ID
export async function getScamPostById(req, res) {
  try {
    const { id } = req.params;
    const post = await CyberScamPost.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }

    res.json(post);
  } catch (error) {
    console.error('❌ Error al obtener la noticia:', error.message);
    res.status(500).json({ error: 'Error al cargar la noticia' });
  }
}
