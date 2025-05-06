import app from './src/app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;


const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    //, {
      //useNewUrlParser: true,
      //useUnifiedTopology: true
    //});
    console.log('✅ Conectado a MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB', error);
    process.exit(1);
  }
};

startServer();
