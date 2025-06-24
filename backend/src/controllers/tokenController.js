import UserTokenBalance from '../models/UserTokenBalance.js';
import TokenTransaction from '../models/TokenTransaction.js';


export const getTokenBalance = async (req, res) => {
  try {
    const balance = await UserTokenBalance.findOne({ user: req.user._id });
    res.json({ balance: balance?.balance || 0 });
  } catch (error) {
    console.error('❌ Error al obtener saldo de tokens:', error);
    res.status(500).json({ message: 'Error al obtener saldo de tokens' });
  }
};

export const getUserBalanceById = async (req, res) => {
  const { userId } = req.params;
  const balance = await UserTokenBalance.findOne({ user: userId });
  res.json({ balance: balance?.balance || 0 });
};

export const updateUserBalance = async (req, res) => {
  const { userId } = req.params;
  const { amount, reason } = req.body;

  if (typeof amount !== 'number') {
    return res.status(400).json({ message: 'Cantidad inválida' });
  }

  const balanceDoc = await UserTokenBalance.findOneAndUpdate(
    { user: userId },
    { $inc: { balance: amount }, $set: { lastUpdate: new Date() } },
    { upsert: true, new: true }
  );

  await TokenTransaction.create({
    user: userId,
    type: 'admin',
    amount,
    tool: 'admin-panel',
    description: reason || 'Ajuste manual de tokens por administrador'
  });

  res.json({ balance: balanceDoc.balance });
};

export const getUserTokenHistory = async (req, res) => {
  try {
    const transactions = await TokenTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // o paginación futura

    res.json(transactions);
  } catch (err) {
    console.error('❌ Error al obtener historial de tokens:', err);
    res.status(500).json({ message: 'Error al obtener historial de tokens' });
  }
};