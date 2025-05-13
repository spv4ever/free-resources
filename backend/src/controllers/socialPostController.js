import SocialPost from '../models/SocialPost.js';
import AiTool from '../models/AiTool.js'; // y el resto según el tipo
import CyberScamPost from '../models/CyberScamPost.js';

// GET: lista de posts
export const getSocialPosts = async (req, res) => {
  try {
    const posts = await SocialPost.find().sort({ createdAt: -1 }).limit(100);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los posts sociales' });
  }
};

export const deleteDescartados = async (req, res) => {
    try {
      const result = await SocialPost.deleteMany({ status: 'descartado' });
      res.status(200).json({ message: 'Posts descartados eliminados', deletedCount: result.deletedCount });
    } catch (error) {
      console.error('Error al eliminar posts descartados:', error);
      res.status(500).json({ message: 'Error al eliminar posts descartados' });
    }
  };

// POST: generar texto para un post
export const generateSocialPost = async (req, res) => {
    const { refType, refId, variant = 'profesional' } = req.body;
  
    try {
      let data;
      switch (refType) {
        case 'aiTool':
          data = await AiTool.findById(refId);
          break;
        case 'cyberScamPost':
          data = await CyberScamPost.findById(refId);
          break;
        default:
          return res.status(400).json({ message: 'Tipo no soportado' });
      }
  
      if (!data) return res.status(404).json({ message: 'Recurso no encontrado' });
  
      const texto = generarTextoBase(data, refType, variant);
  
      const post = await SocialPost.create({
        refType,
        refId,
        generatedText: texto,
        variant,
      });
  
      res.status(201).json(post);
    } catch (err) {
      res.status(500).json({ message: 'Error al generar post social' });
    }
  };

// PUT: actualizar estado del post
export const updateSocialPostStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const post = await SocialPost.findByIdAndUpdate(id, { status }, { new: true });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar estado' });
  }
};
function slugify(text) {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
  }
// Generador simulado de texto
function generarTextoBase(data, tipo, variante) {
    switch (tipo) {
      case 'aiTool':
        return `🧠 ¡Nueva herramienta IA añadida!\n` +
               `✨ ${data.herramientaAI}: ${data.descripcion}\n` +
               `🔗 https://keikodev.es/ai-links\n` +
               `#IA #HerramientasGratis #Tecnología`;
  
      case 'cyberScamPost':
        return `🚨 ¡Nueva alerta de ciberestafa!\n` +
               `🕵️‍♂️ ${data.titulo}\n` +
               `📅 Detectada el ${new Date(data.createdAt).toLocaleDateString('es-ES')}\n` +
               `🔗 https://keikodev.es/scam-posts/${data._id}\n` +
               `#Ciberseguridad #Estafas #Phishing`;
  
      default:
        return 'Contenido no disponible.';
    }
  }
