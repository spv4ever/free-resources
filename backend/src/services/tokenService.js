import UserTokenBalance from '../models/UserTokenBalance.js';
import TokenTransaction from '../models/TokenTransaction.js';

export const consumirToken = async ({ userId, type = 'generation', tool = 'comfyui', description = 'Generación de imagen' }) => {
  const balance = await UserTokenBalance.findOne({ user: userId });

  if (!balance || balance.balance < 1) {
    throw new Error('No tienes tokens suficientes');
  }

  balance.balance -= 1;
  balance.lastUpdate = new Date();
  await balance.save();

  await TokenTransaction.create({
    user: userId,
    type,
    amount: -1,
    tool,
    description
  });
};

export const reembolsarToken = async ({ userId, reason = 'Rollback generación fallida' }) => {
  const balance = await UserTokenBalance.findOneAndUpdate(
    { user: userId },
    { $inc: { balance: 1 }, $set: { lastUpdate: new Date() } },
    { new: true, upsert: true }
  );

  await TokenTransaction.create({
    user: userId,
    type: 'refund',
    amount: +1,
    tool: 'comfyui',
    description: reason
  });

  return { ok: true, balance: balance.balance };
};

export const otorgarTokensDiarios = async (userId) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  let balanceDoc = await UserTokenBalance.findOne({ user: userId });

  // Si no existe, lo creamos y registramos la primera asignación
  if (!balanceDoc) {
    balanceDoc = await UserTokenBalance.create({
      user: userId,
      balance: 5,
      lastDailyBonus: hoy
    });

    await TokenTransaction.create({
      user: userId,
      type: 'bonus',
      amount: 5,
      tool: 'daily-bonus',
      description: 'Primera asignación de tokens diarios'
    });

    return 5;
  }

  // Ya tiene, validamos si recibió hoy
  const ultimaFecha = new Date(balanceDoc.lastDailyBonus || 0);
  ultimaFecha.setHours(0, 0, 0, 0);

  if (ultimaFecha >= hoy) {
    return 0; // ⚠️ Ya recibió el bonus hoy → salimos sin registrar
  }

  // ✅ Bonus válido
  balanceDoc.balance += 5;
  balanceDoc.lastDailyBonus = new Date();
  await balanceDoc.save();

  await TokenTransaction.create({
    user: userId,
    type: 'bonus',
    amount: 5,
    tool: 'daily-bonus',
    description: 'Carga diaria de tokens'
  });

  return 5;
};

