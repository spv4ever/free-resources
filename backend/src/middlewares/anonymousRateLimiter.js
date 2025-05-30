import rateLimit from 'express-rate-limit';

const anonymousRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 5,
  message: {
    error: 'Límite de análisis gratuitos alcanzado. Regístrate para continuar.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export default anonymousRateLimiter;
