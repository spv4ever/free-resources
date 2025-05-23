import rateLimit from 'express-rate-limit';
import RateLimitBlock from '../models/RateLimitBlock.js';

export const createRateLimiter = (options = {}) =>
  rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // default: 15 min
    max: options.max || 100,
    handler: async (req, res) => {
      try {
        await RateLimitBlock.create({
          ip: req.ip,
          path: req.originalUrl
        });
      } catch (err) {
        console.error('❌ Error al guardar bloqueo por rate limit:', err.message);
      }

      res.status(429).send('⛔ Demasiadas peticiones, inténtalo más tarde.');
    },
    standardHeaders: true,
    legacyHeaders: false
  });
