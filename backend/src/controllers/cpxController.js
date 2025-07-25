import crypto from 'crypto';
import User from '../models/User.js';
import CpxRecompensa from '../models/CpxRecompensa.js';

const CPX_SECRET = process.env.CPX_SECRET_KEY;
// console.log('💡 CPX_SECRET_KEY:', process.env.CPX_SECRET_KEY);

export const recibirPostbackCpx = async (req, res) => {
  const {
    status,
    trans_id,
    user_id,
    amount_usd,
    hash
  } = req.query;

  if (!status || !trans_id || !user_id || !amount_usd || !hash) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  // Validar la firma
  const expectedHash = crypto
    .createHash('md5')
    .update(trans_id + CPX_SECRET)
    .digest('hex');

  if (hash !== expectedHash) {
    return res.status(403).json({ error: 'Invalid signature' });
  }

  try {
    let recompensa = await CpxRecompensa.findOne({ trans_id });
    const creditos = Math.floor(parseFloat(amount_usd) * 100); // ejemplo: 1 USD = 100 créditos

    if (parseInt(status) === 1) {
      if (!recompensa) {
        const user = await User.findById(user_id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.credits = (user.credits || 0) + creditos;
        await user.save();

        await CpxRecompensa.create({
          trans_id,
          user_id,
          amount_usd,
          creditos_dados: creditos,
          status: 1
        });

        return res.status(200).json({ ok: true, creditos_sumados: creditos });
      } else {
        return res.status(200).json({ msg: 'Already processed' });
      }
    }

    if (parseInt(status) === 2 && recompensa?.status === 1) {
      const user = await User.findById(user_id);
      if (user) {
        user.credits = Math.max(0, (user.credits || 0) - recompensa.creditos_dados);
        await user.save();
      }

      recompensa.status = 2;
      await recompensa.save();

      return res.status(200).json({ ok: true, creditos_revertidos: recompensa.creditos_dados });
    }

    return res.status(200).json({ msg: 'Ignored or already handled' });
  } catch (err) {
    console.error('Error en postback CPX:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
