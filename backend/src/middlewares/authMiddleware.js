import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const protect = async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next(); // dejar pasar la preflight sin validar token
  }

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'No autorizado, token fallido' });
    }
  }

  return res.status(401).json({ message: 'No autorizado, no hay token' });
};

// Middleware para roles de acceso
const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado, solo admin' });
  }
  next();
};

export { protect, admin };

export const isProOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'pro' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Acceso restringido a usuarios PRO o ADMIN.' });
  }
  next();
};