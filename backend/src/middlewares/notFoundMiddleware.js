const notFound = (req, res, next) => {
  if (req.originalUrl.startsWith('/socket.io')) {
    return res.status(204).end(); // Devuelve sin error ni contenido
  }

  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export default notFound;