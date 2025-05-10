import ResourceLibrary from '../models/ResourceLibrary.js';

// @desc    Obtener todos los recursos
// @route   GET /api/resources
// @access  Público
export const getResources = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};

    const resources = await ResourceLibrary.find(filter).sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener recursos' });
  }
};


// @desc    Crear un nuevo recurso
// @route   POST /api/resources
// @access  Público (luego podemos protegerlo para admins)
export const createResource = async (req, res) => {
  try {
    const { title, description, imageUrl, downloadUrl, category } = req.body;

    if (!title || !description || !downloadUrl || !category) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    const cleanImageUrl = imageUrl?.trim() || undefined;

    const newResource = new ResourceLibrary({
      title,
      description,
      imageUrl: cleanImageUrl,
      downloadUrl,
      category
    });

    const savedResource = await newResource.save();
    res.status(201).json(savedResource);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear recurso' });
  }
};

// @desc    Eliminar un recurso
// @route   DELETE /api/resources/:id
// @access  Público (luego protegeremos)
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await ResourceLibrary.findById(id);

    if (!resource) {
      return res.status(404).json({ message: 'Recurso no encontrado' });
    }

    await resource.deleteOne();
    res.json({ message: 'Recurso eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar recurso' });
  }
};

// @desc    Actualizar un recurso
// @route   PUT /api/resources/:id
// @access  Protegido (solo admin)
export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, imageUrl, downloadUrl, category } = req.body;

    const updated = await ResourceLibrary.findByIdAndUpdate(
      id,
      { title, description, imageUrl, downloadUrl, category },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Recurso no encontrado' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar recurso' });
  }
};

// @desc    Obtener número de recursos por categoría
// @route   GET /api/resources/stats/per-category
// @access  Público
export const getResourceStatsPerCategory = async (req, res) => {
  try {
    const stats = await ResourceLibrary.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    res.json(stats.map(item => ({
      category: item._id,
      count: item.count
    })));
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas de recursos por categoría' });
  }
};
