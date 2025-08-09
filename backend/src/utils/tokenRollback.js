// src/utils/tokenRollback.js
import UserTokenBalance from '../models/UserTokenBalance.js';
import TokenTransaction from '../models/TokenTransaction.js';

export async function rollbackDebit(userId, txId, amount) {
  try {
    if (!userId || !txId || !amount) return;

    // Reversa contable: añadimos tokens y registramos transacción
    const balance = await UserTokenBalance.findOne({ user: userId });
    if (balance) {
      balance.tokens += amount;
      await balance.save();
    }
    await TokenTransaction.create({
      user: userId,
      type: 'bonus',
      amount: amount,
      tool: 'comfyui',
      description: `Rollback generación fallida (reversa de ${txId})`
    });
  } catch (e) {
    console.error('[rollbackDebit] ERROR:', e.message);
  }
}
