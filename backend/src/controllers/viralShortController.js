import { franc } from 'franc';
import langs from 'langs';
import ViralShort from '../models/ViralShort.js';
import ShortCategory from '../models/ShortCategory.js';


export const getAllViralShorts = async (req, res) => {
    try {
      const shorts = await ViralShort.find()
        .populate('category', 'nombre') // usamos 'nombre' no 'name'
        .sort({ views: -1 });;
  
      const grouped = {};
  
      for (const short of shorts) {
        const cat = short.category;
        if (!cat) continue;
  
        const catId = cat._id.toString();
        if (!grouped[catId]) {
          grouped[catId] = {
            categoriaId: catId,
            categoriaNombre: cat.nombre,
            shorts: [],
          };
        }
  
        grouped[catId].shorts.push({
          _id: short._id,
          videoId: short.videoId,
          title: short.title,
          description: short.description,
          channelTitle: short.channelTitle,
          thumbnail: short.thumbnail,
          publishedAt: short.publishedAt,
          likes: short.likes,
          views: short.views,
        });
      }
  
      res.json(Object.values(grouped));
    } catch (err) {
      res.status(500).json({ message: 'Error al obtener shorts virales' });
    }
  };

export const createViralShort = async (req, res) => {
  try {
    const body = req.body;
    const rawTitle = body.title || '';

    console.log('📥 Título recibido:', rawTitle);

    const code = franc(rawTitle);
    const lang = code !== 'und' ? langs.where('3', code) : null;
    const langName = lang ? lang.name : 'Desconocido';

    console.log(`🌐 Idioma detectado: ${langName} (${code})`);

    const newShort = new ViralShort({
      ...body,
      languageCode: code,
      languageDetected: langName
    });

    const saved = await newShort.save();
    console.log('✅ Short guardado:', saved);

    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Error creando short:', err);
    res.status(400).json({ message: 'Error al crear short viral', error: err.message });
  }
};

export const deleteViralShort = async (req, res) => {
  try {
    await ViralShort.findByIdAndDelete(req.params.id);
    res.json({ message: 'Short eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar short' });
  }
};

export const getShortsBySubcategoria = async (req, res) => {
  try {
    const { subcat } = req.params;

    const categorias = await ShortCategory.find({ subcategoria: subcat });
    const catIds = categorias.map(c => c._id);

    const shorts = await ViralShort.find({ category: { $in: catIds } })
      .populate('category', 'nombre')
      .sort({ views: -1 });

    const agrupados = categorias.map((cat) => ({
      categoriaId: cat._id,
      categoriaNombre: cat.nombre,
      shorts: shorts.filter((short) => short.category._id.toString() === cat._id.toString())
    }));

    res.json(agrupados);
  } catch (err) {
    console.error('❌ Error en getShortsBySubcategoria:', err);
    res.status(500).json({ message: 'Error al obtener shorts por subcategoría' });
  }
};

export const getShortsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Buscar shorts en español
    let shorts = await ViralShort.find({
      category: categoryId,
      languageCode: 'spa'
    })
      .populate('category', 'nombre')
      .sort({ views: -1 });

    // Si hay menos de 6, completamos con shorts en inglés
    if (shorts.length < 6) {
      const englishShorts = await ViralShort.find({
        category: categoryId,
        languageCode: 'eng'
      })
        .populate('category', 'nombre')
        .sort({ views: -1 })
        .limit(30 - shorts.length); // Solo los necesarios para llegar a 6

      shorts = shorts.concat(englishShorts);
    }

    res.json(shorts);
  } catch (err) {
    console.error('❌ Error en getShortsByCategory:', err);
    res.status(500).json({ message: 'Error al obtener shorts por categoría' });
  }
};
