import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { otorgarTokensDiarios } from '../services/tokenService.js';


dotenv.config();

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'No autorizado, usuario no encontrado' });
      }

      if (!user.isVerified) {
        return res.status(403).json({ message: 'Debes verificar tu correo electrónico antes de acceder.' });
      }

      if (user.blocked) {
        return res.status(403).json({ message: 'Tu cuenta ha sido bloqueada.' });
      }

      req.user = user;

      if (typeof otorgarTokensDiarios === 'function') {
        await otorgarTokensDiarios(user._id);
      }

      return next();
    } catch (error) {
      console.error('Error en middleware protect:', error);
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

export { admin };

export const isProOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'pro' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Acceso restringido a usuarios PRO o ADMIN.' });
  }
  next();
};