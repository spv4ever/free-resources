import mongoose from 'mongoose';

const animeCharacterSchema = new mongoose.Schema({
  anilistId: Number,
  name: String,
  nativeName: String,
  gender: String,
  age: String,
  image: String,
  description: String,
  favourites: Number,
  mainWork: {
    title: { type: String },
    type: { type: String },
    url: { type: String }
  },
  fetchedAt: {
    type: Date,
    default: Date.now
  }
});

if (mongoose.models.AnimeCharacter) {
  delete mongoose.models.AnimeCharacter;
}

export default mongoose.models.AnimeCharacter || mongoose.model('AnimeCharacter', animeCharacterSchema);

