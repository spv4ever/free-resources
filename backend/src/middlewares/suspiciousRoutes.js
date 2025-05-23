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
    /Chrome\/10[0-9]\./,
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
  const isSitegroundPing =
    path === '/.well-known/sg-hosted-ping' && /Avalon API Client/i.test(userAgent);

  const logEntry = {
    ip: req.ip,
    method: req.method,
    path,
    userAgent
  };

  // Siempre logueamos si es sospechoso y no es SiteGround
  if ((isSuspiciousPath || isSuspiciousUA) && !isSitegroundPing) {
    try {
      await SuspiciousAccess.create(logEntry);
    } catch (err) {
      console.error('❌ Error al guardar intento sospechoso en MongoDB:', err.message);
    }
  }

  // Solo bloqueamos si la RUTA es peligrosa
  if (isSuspiciousPath && !isSitegroundPing) {
    console.warn(`[ALERTA BLOQUEO] Ruta crítica:
    ⏱️ ${new Date().toISOString()}
    📍 IP: ${req.ip}
    🧭 Ruta: ${req.method} ${path}
    🕵️‍♂️ UA: ${userAgent}
    `);

    return res.status(403).send('Acceso denegado');
  }

  next();
};
