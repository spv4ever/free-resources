const notFound = (req, res, next) => {
  if (req.originalUrl.startsWith('/socket.io')) {
    // Silenciar siempre las peticiones a /socket.io
    return res.status(204).end(); // 204 = No Content
  }

  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export default notFound;