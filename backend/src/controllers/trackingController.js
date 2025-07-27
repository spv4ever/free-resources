import TrackingClick from '../models/TrackingClick.js';
import UserTokenBalance from '../models/UserTokenBalance.js';
import TokenTransaction from '../models/TokenTransaction.js';

export const registerClick = async (req, res) => {
  try {
    const userId = req.user._id;

    const data = await TrackingClick.findOneAndUpdate(
      { user: userId },
      { $inc: { clicks: 1 } },
      { new: true, upsert: true }
    );

    if (data.clicks >= 5) {
      const amount = 5;

      // 1. Sumar tokens al balance
      const balanceDoc = await UserTokenBalance.findOneAndUpdate(
        { user: userId },
        { $inc: { balance: amount }, $set: { lastUpdate: new Date() } },
        { upsert: true, new: true }
      );

      // 2. Registrar la transacción
      await TokenTransaction.create({
        user: userId,
        type: 'ad_click',
        amount,
        tool: 'ad-click',
        description: 'Tokens por apoyar con anuncios (5 clics)'
      });

      // 3. Reiniciar contador de clics
      data.clicks = 0;
      await data.save();

      return res.json({
        rewardGiven: true,
        balance: balanceDoc.balance,
        clicks: 0
      });
    }

    return res.json({
      rewardGiven: false,
      clicks: data.clicks
    });
  } catch (error) {
    console.error('❌ Error al registrar clic publicitario:', error);
    res.status(500).json({ message: 'Error al registrar clic' });
  }
};
