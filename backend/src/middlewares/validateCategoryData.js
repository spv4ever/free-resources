export const validateCategoryData = (req, res, next) => {
    const { name, description } = req.body;
  
    if (!name || !description) {
      return res.status(400).json({ message: 'Faltan datos obligatorios (nombre, descripción)' });
    }
  
    next();
  };
  
  