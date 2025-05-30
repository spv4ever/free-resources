export const validateUrl = (req, res, next) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'No se proporcionó un enlace válido.' });
  }

  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: 'Solo se permiten enlaces http o https.' });
    }
    // Bloqueo opcional de IPs y localhost
    if (
      parsedUrl.hostname === 'localhost' ||
      /^\d{1,3}(\.\d{1,3}){3}$/.test(parsedUrl.hostname)
    ) {
      return res.status(400).json({ error: 'Enlace no permitido.' });
    }

    next();
  } catch {
    return res.status(400).json({ error: 'El formato del enlace no es válido.' });
  }
};
