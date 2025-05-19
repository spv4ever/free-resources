import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import resourceLibraryRoutes from './routes/resourceLibraryRoutes.js';
import errorHandler from './middlewares/errorMiddleware.js';
import notFound from './middlewares/notFoundMiddleware.js';
import categoryRoutes from './routes/categoryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import aiToolRoutes from './routes/aiToolRoutes.js';
import nasaImageRoutes from './routes/nasaImageRoutes.js';
import fetchNasaImageDaily from './jobs/fetchNasaImage.js';
import { fetchTodayImage } from './jobs/fetchNasaImage.js';
import adminToolsRoutes from './routes/adminToolsRoutes.js';
import youtubeChannelRoutes from './routes/youtubeChannelRoutes.js';
import trainingResourceRoutes from './routes/trainingResourceRoutes.js';
import shortCategoryRoutes from './routes/shortCategoryRoutes.js';
import viralShortRoutes from './routes/viralShortRoutes.js';
import spacexRoutes from './routes/spacexRoutes.js';
import gmailRoutes from './routes/gmailRoutes.js';
import { runScheduledImports } from './services/emailScheduler.js';
import emailContextsRoutes from './routes/emailContexts.js';
import scamPostRoutes from './routes/scamPostRoutes.js';
import adminEmailEntryRoutes from './routes/adminEmailEntryRoutes.js';
import adminEmailArticleRoutes from './routes/adminEmailArticleRoutes.js';
import aiDetectorRoutes from './routes/aiDetectorRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import socialPostRoutes from './routes/socialPostRoutes.js';
import animeCharacterRoutes from './routes/animeCharacterRoutes.js';
import animePromptDataRoutes from './routes/animePromptDataRoutes.js';
import animePromptRoutes from './routes/animePromptRoutes.js';
import affiliateLinkRoutes from './routes/affiliateLinkRoutes.js';
import affiliateClickRoutes from './routes/affiliateClickRoutes.js';
import igraalDealRoutes from './routes/igraalDealRoutes.js';
import igraalCouponRoutes from './routes/igraalCouponRoutes.js';
import topSeriesRoutes from './routes/topSeriesRoutes.js';







// Otras rutas...



 // 👈 Importa las rutas de autenticación

dotenv.config();

// 🔍 Diagnóstico de variables peligrosas en entorno Render
console.log('🔍 Verificando variables de entorno cargadas:');
Object.entries(process.env).forEach(([key, value]) => {
  if (typeof value === 'string' && value.match(/^\/?:|\/api\/:|\/:\//)) {
    console.error(`❌ Variable de entorno sospechosa: ${key} = ${value}`);
  }
});

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'https://free.keikodev.es','https://keikodev.es'],
    credentials: true
  }));
  
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/socket.io')) {
      return res.status(204).end();
    }
    next();
  });
// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
fetchNasaImageDaily();

//fetchTodayImage();

// Rutas
app.use('/api/resources', resourceLibraryRoutes);
app.use('/api/anime-characters', animeCharacterRoutes)
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/aitools', aiToolRoutes);
app.use('/api/nasa-images', nasaImageRoutes);
app.use('/api/admin', adminToolsRoutes);
app.use('/api/social-posts', socialPostRoutes);
app.use('/api/youtube-channels', youtubeChannelRoutes);
app.use('/api/training-resources', trainingResourceRoutes);
app.use('/api/short-categories', shortCategoryRoutes);
app.use('/api/viral-shorts', viralShortRoutes);
app.use('/api/spacex', spacexRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/admin/email-contexts', emailContextsRoutes);
app.use('/api/scam-posts', scamPostRoutes);
app.use('/api/admin/email-entries', adminEmailEntryRoutes);
app.use('/api/admin/email-articles', adminEmailArticleRoutes);
app.use('/api/ai', aiDetectorRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/anime-prompt-data', animePromptDataRoutes);
app.use('/api/anime-prompts', animePromptRoutes);
app.use('/api/affiliate-links', affiliateLinkRoutes);
app.use('/api/affiliate-clicks', affiliateClickRoutes);
app.use('/api/igraal-deals', igraalDealRoutes);
app.use('/api/igraal-coupons', igraalCouponRoutes);
app.use('/api/tops', topSeriesRoutes);

// app.use((req, res, next) => {
//   try {
//     decodeURIComponent(req.path); // si viene ruta malformada la pilla aquí
//     next();
//   } catch (err) {
//     console.error('❌ Ruta malformada detectada:', req.path);
//     res.status(400).send('Ruta no válida');
//   }
// });


import './jobs/spaceXJob.js';
import './jobs/igraalJob.js';
import './jobs/index.js';


// Intervalo de ejecución: cada 6h (puedes cambiarlo)
const IMPORT_INTERVAL = 1000 * 60 * 60 * 6;

// Primera ejecución 10s después de iniciar el backend
setTimeout(() => {
  console.log('▶️ Importación automática inicial');
  runScheduledImports();
}, 10000);

// Repetición automática cada IMPORT_INTERVAL
setInterval(() => {
  console.log('🕒 Ejecutando importación programada...');
  runScheduledImports();
}, IMPORT_INTERVAL);


// // Ruta de prueba
// app.get('/', (req, res) => {
//   res.send('API funcionando correctamente 🚀');
// });
app.get('/', (req, res) => {
    res.send('🚀 API de KeikoDev activa');
  });

// // Si estamos en producción, servir frontend
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../frontend/build')));

//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
//   });
// }
// Middleware de ruta no encontrada
app.use(notFound);

// Middleware de manejo de errores
app.use(errorHandler);

// Exportar app
export default app;
