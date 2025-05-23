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

  const suspiciousUserAgents = [
    /Chrome\/108\.0\.0\.0/,
    /Chrome\/81\.0\.4044\.129/,
    /Chrome\/10[0-9]\./,           // Chrome 100–109
    /Arora/i,
    /Unknown.*UNIX/i,
    /^Mozilla\/5\.0 \(Unknown/i,
    /curl/i,
    /wget/i,
    /python/i,
    /httpclient/i,
    /libwww/i,
    /Go-http-client/i,
    /Java\/[0-9]/,
    /node-fetch/i
  ];

  const path = req.originalUrl || '';
  const userAgent = req.get('User-Agent') || '';
  const isSuspiciousPath = suspiciousPatterns.some(pattern => pattern.test(path));
  const isSuspiciousUA = suspiciousUserAgents.some(regex => regex.test(userAgent));
  const isSuspicious = isSuspiciousPath || isSuspiciousUA;

  if (isSuspicious) {
    const logEntry = {
      ip: req.ip,
      method: req.method,
      path,
      userAgent
    };

    console.warn(`[ALERTA] Ruta sospechosa detectada:
    ⏱️ ${new Date().toISOString()}
    📍 IP: ${logEntry.ip}
    🧭 Ruta: ${logEntry.method} ${logEntry.path}
    🕵️‍♂️ User-Agent: ${logEntry.userAgent}
    `);

    try {
      await SuspiciousAccess.create(logEntry);
    } catch (err) {
      console.error('❌ Error al guardar intento sospechoso en MongoDB:', err.message);
    }

    return res.status(403).send('Acceso denegado');
  }

  next();
};
