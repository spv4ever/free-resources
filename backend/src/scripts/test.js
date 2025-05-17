import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import IllustrationStyle from '../models/IllustrationStyle.js';
import ViewAngle from '../models/ViewAngle.js';
import Outfit from '../models/Outfit.js';
import Location from '../models/Location.js';
import Pose from '../models/Pose.js';
import Tag from '../models/Tag.js';

const seedData = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  console.log('Conectado a MongoDB ✅');

  await IllustrationStyle.deleteMany();
  await ViewAngle.deleteMany();
  await Outfit.deleteMany();
  await Location.deleteMany();
  await Pose.deleteMany();
  await Tag.deleteMany();

  await IllustrationStyle.insertMany([
    { style: 'Anime Illustration' },
    { style: 'Ultra-Realistic Style' },
    { style: '3D Render' }
  ]);

  await ViewAngle.insertMany([
    { view: 'from below' },
    { view: 'side view' },
    { view: 'overhead' }
  ]);

  await Outfit.insertMany([
    { description: 'black lace lingerie with golden strap details', style: 'sexy' },
    { description: 'classic Japanese school uniform', style: 'school' },
    { description: 'white sci-fi armor with glowing accents', style: 'sci-fi' }
  ]);

  await Location.insertMany([
    { place: 'Luxury Pool' },
    { place: 'Cherry Blossom Garden' },
    { place: 'Neo-Tokyo Rooftop at night' }
  ]);

  await Pose.insertMany([
    { pose: 'Standing' },
    { pose: 'Kneeling' },
    { pose: 'Floating' }
  ]);

  await Tag.insertMany([
    { value: 'nsfw', category: 'safety' },
    { value: 'wet skin', category: 'effect' },
    { value: 'sunlight', category: 'lighting' }
  ]);

  console.log('🌱 Datos insertados correctamente.');
  process.exit();
};

seedData().catch(err => {
  console.error('❌ Error al insertar datos:', err);
  process.exit(1);
});
