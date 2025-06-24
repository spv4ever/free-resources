// models/UserTokenBalance.js
import mongoose from 'mongoose';

const tokenBalanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  },
  lastDailyBonus: { type: Date }
});

export default mongoose.model('UserTokenBalance', tokenBalanceSchema);
