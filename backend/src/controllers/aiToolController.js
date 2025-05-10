import AiTool from '../models/AiTool.js';

// @desc Obtener todas las herramientas AI
// @route GET /api/aitools
// @access Público
export const getAiTools = async (req, res) => {
  try {
    const tools = await AiTool.find().sort({ createdAt: -1 });
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las herramientas' });
  }
};

// @desc Crear una nueva herramienta AI
// @route POST /api/aitools
// @access Protegido (Admin)
export const createAiTool = async (req, res) => {
  try {
    const {
      herramientaAI,
      descripcion,
      url,
      tipo,
      planGratuito,
      estrellas,
      icon,
      url_formacion
    } = req.body;

    if (!herramientaAI || !descripcion || !url || !tipo || estrellas === undefined) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const newTool = new AiTool({
      herramientaAI,
      descripcion,
      url,
      tipo,
      planGratuito,
      estrellas,
      icon,
      url_formacion
    });

    const savedTool = await newTool.save();
    res.status(201).json(savedTool);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la herramienta' });
  }
};

// @desc Editar una herramienta AI
// @route PUT /api/aitools/:id
// @access Protegido (Admin)
export const updateAiTool = async (req, res) => {
    try {
      const { id } = req.params;
  
      const updated = await AiTool.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
  
      if (!updated) {
        return res.status(404).json({ message: 'Herramienta no encontrada' });
      }
  
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la herramienta' });
    }
  };
  

// @desc Eliminar una herramienta
// @route DELETE /api/aitools/:id
// @access Protegido (Admin)
export const deleteAiTool = async (req, res) => {
  try {
    const { id } = req.params;
    const tool = await AiTool.findById(id);

    if (!tool) {
      return res.status(404).json({ message: 'Herramienta no encontrada' });
    }

    await tool.deleteOne();
    res.json({ message: 'Herramienta eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la herramienta' });
  }
};


// @desc    Obtener número de herramientas IA por categoría
// @route   GET /api/ai-tools/stats/per-category
// @access  Público
export const getAiToolStatsPerCategory = async (req, res) => {
  try {
    const stats = await AiTool.aggregate([
      {
        $group: {
          _id: '$tipo', // ✅ agrupamos por el campo correcto
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.json(stats.map(item => ({
      tipo: item._id,
      count: item.count
    })));
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas de herramientas IA' });
  }
};

