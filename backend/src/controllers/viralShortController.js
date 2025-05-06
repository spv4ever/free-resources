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
    const newShort = new ViralShort(req.body);
    const saved = await newShort.save();
    res.status(201).json(saved);
  } catch (err) {
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

