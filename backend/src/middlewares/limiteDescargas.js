import User from '../models/User.js';

export const limitarDescargas = async (req, res, next) => {
  const user = req.user;

  if (!user) {
    if (!req.session) {
      return res.status(500).json({ message: 'Sesión no disponible' });
    }

    const hoy = new Date().toISOString().split('T')[0];

    if (req.session.ultimoUsoAnonimo !== hoy) {
      req.session.anonimoDescargasHoy = 0;
      req.session.ultimoUsoAnonimo = hoy;
    }

    if ((req.session.anonimoDescargasHoy || 0) >= 3) {
      return res.status(429).json({ message: 'Límite diario alcanzado para usuarios no registrados.' });
    }

    req.session.anonimoDescargasHoy = (req.session.anonimoDescargasHoy || 0) + 1;
    return next();
  }

  // ✅ Sin límites para admin o pro
  if (user.role === 'admin' || user.role === 'pro') {
    return next();
  }

  const ahora = new Date();
  const hoy = ahora.toISOString().split('T')[0];
  const fechaUltimoUso = user.ultimoUsoDescargas?.toISOString().split('T')[0];

  if (fechaUltimoUso !== hoy) {
    user.descargasHoy = 0;
    user.ultimoUsoDescargas = ahora;
    await user.save();
  }

  if (user.descargasHoy >= 10) {
    return res.status(429).json({ message: 'Has alcanzado tu límite diario de descargas.' });
  }

  return next();
};
