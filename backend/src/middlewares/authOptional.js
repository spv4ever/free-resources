import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const authOptional = async (req, res, next) => {
  req.user = null; // 👈 asegúrate de inicializarlo siempre
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).lean();
      console.log('🔐 Usuario detectado en middleware:', req.user);
      delete req.user.password;
    } catch (err) {
      console.warn('⚠️ Token inválido (se ignora):', err.message);
    }
  }

  next(); // sigue pase lo que pase
};

export default authOptional;
