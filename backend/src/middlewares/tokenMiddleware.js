import UserTokenBalance from '../models/UserTokenBalance.js';

export const requiereTokens = async (req, res, next) => {
  try {
    const balance = await UserTokenBalance.findOne({ user: req.user._id });
    if (!balance || balance.balance < 1) {
      return res.status(403).json({ message: '⚠️ No tienes tokens suficientes para generar imágenes.' });
    }
    next();
  } catch (err) {
    console.error('❌ Error en requiereTokens:', err);
    res.status(500).json({ message: 'Error al verificar saldo de tokens' });
  }
};
