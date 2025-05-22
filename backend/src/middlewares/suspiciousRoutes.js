import SuspiciousAccess from '../models/SuspiciousAccess.js';

export const suspiciousRouteLogger = async (req, res, next) => {
  const suspiciousPatterns = [
    /^\/\.well-known\//,
    /^\/actuator\//,
    /^\/admin\//,
    /^\/wp-/,
    /^\/env$/,
    /^\/\.env$/,
    /^\/config\./,
    /^\/remote\/logincheck/,
    /^\/global-protect\//
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(req.path));

  if (isSuspicious) {
    const logEntry = {
      ip: req.ip,
      method: req.method,
      path: req.originalUrl,
      userAgent: req.get('User-Agent')
    };

    console.warn(`[ALERTA] Ruta sospechosa detectada:
    ⏱️ ${new Date().toISOString()}
    📍 IP: ${logEntry.ip}
    🧭 Ruta: ${logEntry.method} ${logEntry.path}
    🕵️‍♂️ User-Agent: ${logEntry.userAgent}
    `);

    // 🗃️ Guarda en MongoDB
    try {
      await SuspiciousAccess.create(logEntry);
    } catch (err) {
      console.error('❌ Error al guardar intento sospechoso en MongoDB:', err.message);
    }

    return res.status(403).send('Acceso denegado');
  }

  next();
};
