// scripts/seedWeekly.js
import 'dotenv/config';
import mongoose from 'mongoose';
import InstagramAccount from '../models/InstagramAccount.js';
import Schedule from '../models/Schedule.js';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error('Falta MONGO_URI en .env');

await mongoose.connect(MONGO_URI);

// 👇 ajusta alias y tz si quieres
const alias = process.env.IG_ACCOUNT_ALIAS || 'keikodevfree';

const acc = await InstagramAccount.findOneAndUpdate(
  { alias },
  {
    alias,
    igUserId: process.env.IG_USER_ID_ACCOUNT2 || 'FAKE_USER_ID',
    accessToken: process.env.IG_ACCESS_TOKEN_ACCOUNT2 || 'FAKE_TOKEN',
    timezone: 'Europe/Madrid',
    isEnabled: true,
  },
  { upsert: true, new: true }
);

// Semilla de calendario mínima
await Schedule.findOneAndUpdate(
  { accountId: acc._id },
  {
    post:     { mon:{enabled:true,time:'10:00'}, wed:{enabled:true,time:'10:00'}, fri:{enabled:true,time:'10:00'} },
    carousel: { tue:{enabled:true,time:'18:00'} },
    reel:     { thu:{enabled:true,time:'21:30'} },
    source: 'weekly'
  },
  { upsert: true, new: true }
);

console.log('OK:', { accountId: acc._id.toString(), alias: acc.alias });
await mongoose.disconnect();
process.exit(0);
