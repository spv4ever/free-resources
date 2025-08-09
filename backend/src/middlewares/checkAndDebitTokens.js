// src/middlewares/checkAndDebitTokens.js
import UserTokenBalance from '../models/UserTokenBalance.js';
import TokenTransaction from '../models/TokenTransaction.js';

export default function checkAndDebitTokens(cost = 1) {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id;
      if (!userId) return res.status(401).json({ error: 'No autenticado' });

      const balance = await UserTokenBalance.findOne({ user: userId });
      if (!balance || balance.tokens < cost) {
        return res.status(402).json({ error: 'Tokens insuficientes' });
      }

      // Descontar (y registrar transacción)
      balance.tokens -= cost;
      await balance.save();

      const tx = await TokenTransaction.create({
        user: userId,
        type: 'generation',
        amount: -cost,
        tool: 'comfyui',
        description: 'Texto a Imagen'
      });

      // Guardamos marcas en req para posible rollback
      req.__tokenCost = cost;
      req.__tokenTxId = tx._id;

      next();
    } catch (err) {
      console.error('[checkAndDebitTokens] ERROR:', err.message);
      return res.status(500).json({ error: 'No se pudo validar/descontar tokens' });
    }
  };
}
