import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EmailImportContext from './src/models/EmailImportContext.js';

dotenv.config();

async function seedContexts() {
  await mongoose.connect(process.env.MONGO_URI);

  const data = [
    {
      context: 'ciberestafas',
      searchTerm: 'subject:"Google ciberestafas Notificaciones diarias"',
      frequency: 'daily'
    },
    {
      context: 'netflix',
      searchTerm: 'subject:"Tu cuenta de Netflix"',
      frequency: 'daily'
    }
  ];

  for (const entry of data) {
    const exists = await EmailImportContext.findOne({ context: entry.context });
    if (!exists) {
      await EmailImportContext.create(entry);
      console.log(`✅ Insertado: ${entry.context}`);
    }
  }

  process.exit();
}

seedContexts();
