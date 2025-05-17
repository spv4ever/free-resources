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
  console.log('✅ Conectado a MongoDB');

  await IllustrationStyle.deleteMany();
  await ViewAngle.deleteMany();
  await Outfit.deleteMany();
  await Location.deleteMany();
  await Pose.deleteMany();
  await Tag.deleteMany();

  await IllustrationStyle.insertMany([
    { style: 'Anime Illustration' },
    { style: 'Ultra-Realistic Style' },
    { style: '3D Render' },
    { style: 'Watercolor Anime Style' },
    { style: 'Cyberpunk Neon' },
    { style: 'Retro 90s Anime' },
    { style: 'Manga Inked Style' },
    { style: 'Studio Ghibli Inspired' },
    { style: 'Cel Shading' },
    { style: 'Dark Fantasy Art' }
  ]);

  await ViewAngle.insertMany([
    { view: 'from below' },
    { view: 'from above' },
    { view: 'side view' },
    { view: 'over-the-shoulder' },
    { view: 'close-up' },
    { view: 'full body frontal' },
    { view: 'low angle dramatic' },
    { view: 'top-down perspective' },
    { view: '3/4 perspective' },
    { view: 'dynamic action angle' }
  ]);

  await Outfit.insertMany([
    { description: 'black lace lingerie with golden strap details', style: 'sexy' },
    { description: 'classic Japanese school uniform', style: 'school' },
    { description: 'white sci-fi armor with glowing accents', style: 'sci-fi' },
    { description: 'traditional kimono with sakura patterns', style: 'cultural' },
    { description: 'steampunk adventurer gear', style: 'steampunk' },
    { description: 'idol stage costume with glitter', style: 'idol' },
    { description: 'modern casual streetwear', style: 'casual' },
    { description: 'futuristic bodysuit with neon lines', style: 'cyber' },
    { description: 'dark gothic lolita outfit', style: 'gothic' },
    { description: 'magical girl transformation attire', style: 'magical' }
  ]);

  await Location.insertMany([
    { place: 'Luxury Pool' },
    { place: 'Cherry Blossom Garden' },
    { place: 'Neo-Tokyo Rooftop at night' },
    { place: 'Abandoned temple in the forest' },
    { place: 'Digital cyberspace world' },
    { place: 'Moonlight-lit cemetery' },
    { place: 'Floating island in the sky' },
    { place: 'Hot springs under stars' },
    { place: 'Urban alley with neon signs' },
    { place: 'Snowy mountain shrine' }
  ]);

  await Pose.insertMany([
    { pose: 'Standing' },
    { pose: 'Kneeling' },
    { pose: 'Floating' },
    { pose: 'Leaning against a wall' },
    { pose: 'Jumping mid-air' },
    { pose: 'Sitting with legs crossed' },
    { pose: 'Arms behind back' },
    { pose: 'Drawing a katana' },
    { pose: 'Running with intensity' },
    { pose: 'Falling backward in slow motion' }
  ]);

  await Tag.insertMany([
    { value: 'nsfw', category: 'safety' },
    { value: 'sfw', category: 'safety' },
    { value: 'suggestive', category: 'safety' },
    { value: 'mild nudity', category: 'safety' },
    { value: 'wet skin', category: 'effect' },
    { value: 'motion blur', category: 'effect' },
    { value: 'petals in the air', category: 'effect' },
    { value: 'sparkling dust', category: 'effect' },
    { value: 'wind effects', category: 'effect' },
    { value: 'sunlight', category: 'lighting' },
    { value: 'neon lighting', category: 'lighting' },
    { value: 'backlight glow', category: 'lighting' },
    { value: 'golden hour', category: 'lighting' },
    { value: 'underwater light rays', category: 'lighting' },
    { value: 'melancholy', category: 'mood' },
    { value: 'intense stare', category: 'mood' },
    { value: 'blushing', category: 'mood' },
    { value: 'confident', category: 'mood' },
    { value: 'mysterious smile', category: 'mood' }
  ]);

  console.log('🌱 Datos insertados correctamente.');
  process.exit();
};

seedData().catch(err => {
  console.error('❌ Error al insertar datos:', err);
  process.exit(1);
});
