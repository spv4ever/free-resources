import app, { initializePostStartTasks } from './src/app.js';
import { initializeRuntimeTasks } from './src/bootstrapRuntimeTasks.js';
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

    app.listen(PORT, async () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      await initializeRuntimeTasks();
      await initializePostStartTasks();
    
      // Verificar rutas registradas
      // setTimeout(() => {
      //   try {
      //     if (app._router?.stack) {
      //       console.log('📡 Rutas registradas en Express:');
      //       app._router.stack
      //         .filter(r => r.route)
      //         .forEach(r => {
      //           const methods = Object.keys(r.route.methods).join(', ').toUpperCase();
      //           console.log(`→ [${methods}] ${r.route.path}`);
      //         });
      //     } else {
      //       console.warn('⚠️ No se pudo acceder al router para listar las rutas');
      //     }
      //   } catch (err) {
      //     console.error('❌ Error mostrando rutas registradas:', err.message);
      //   }
      // }, 100); // esperamos a que Express termine de registrar todo
    });
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB', error);
    process.exit(1);
  }
};

startServer();
