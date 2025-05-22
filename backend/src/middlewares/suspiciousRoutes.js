// middlewares/suspiciousRoutes.js
export const suspiciousRouteLogger = (req, res, next) => {
  const suspiciousPatterns = [
    /^\/\.well-known\//,
    /^\/actuator\//,
    /^\/admin\//,
    /^\/wp-/,
    /^\/env$/,
    /^\/\.env$/,
    /^\/config\./
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(req.path));

  if (isSuspicious) {
    console.warn(`[ALERTA] Ruta sospechosa detectada:
    ⏱️ ${new Date().toISOString()}
    📍 IP: ${req.ip}
    🧭 Ruta: ${req.method} ${req.originalUrl}
    🕵️‍♂️ User-Agent: ${req.get('User-Agent')}
    `);

    // Opcional: bloquear la ruta
    return res.status(403).send('Forbidden');
  }

  next();
};
