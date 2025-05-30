import rateLimit from 'express-rate-limit';
import anonymousRateLimiter from './anonymousRateLimiter.js';

// Crea un rate limiter para usuarios `free`
const freeUserLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 20,
  message: {
    error: 'Has alcanzado el límite diario de análisis para usuarios gratuitos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware condicional basado en el rol
const conditionalRateLimiter = (req, res, next) => {
  const user = req.user;

  if (user?.role === 'admin' || user?.role === 'pro') {
    return next(); // sin límite
  }

  if (user?.role === 'free') {
    return freeUserLimiter(req, res, next); // hasta 20 por día
  }

  // Sin registro → anónimo
  return anonymousRateLimiter(req, res, next); // hasta 5 por IP
};

export default conditionalRateLimiter;
