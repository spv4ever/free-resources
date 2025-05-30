import express from 'express';
import rateLimit from 'express-rate-limit';
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
import seriesRoutes from './routes/seriesRoutes.js';
import { suspiciousRouteLogger } from './middlewares/suspiciousRoutes.js';
import { secureHeaders } from './middlewares/secureHeaders.js';
import seriesCategoryRoutes from './routes/seriesCategoryRoutes.js';
import adminSuspiciousRoutes from './routes/adminSuspiciousRoutes.js';
import { createRateLimiter } from './middlewares/rateLimitHandler.js';
import rateLimitBlockRoutes from './routes/rateLimitBlockRoutes.js';
import adminEnrichRoute from './routes/adminEnrichRoute.js';
import { startEnrichSpacexJob } from './jobs/enrichSpacexJob.js';
import spacexPublicRoutes from './routes/spacexPublicRoutes.js';
import spacexAdminRoutes from './routes/spacexAdminRoutes.js';
import linkAnalysisRoutes from './routes/linkAnalysisRoutes.js';
import adminLinkAnalysisRoutes from './routes/adminLinkAnalysisRoutes.js';
import proLinkAnalysisRoutes from './routes/proLinkAnalysisRoutes.js';








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

// // 🧱 Limitar peticiones por IP (protección básica anti-bots)
// const generalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutos
//   max: 100, // máximo 100 peticiones por IP
//   message: '⛔ Demasiadas peticiones desde esta IP, inténtalo más tarde.',
//   standardHeaders: true, 
//   legacyHeaders: false,
// });

// Limitar rutas sensibles
app.use('/api/auth', createRateLimiter({ max: 30, windowMs: 15 * 60 * 1000 }));
app.use('/api/upload', createRateLimiter({ max: 20, windowMs: 15 * 60 * 1000 }));
app.use('/api/ai', createRateLimiter({ max: 40, windowMs: 15 * 60 * 1000 }));
app.use('/api/admin', createRateLimiter({ max: 50, windowMs: 15 * 60 * 1000 }));

// app.use(generalLimiter);


app.use(cors({
    origin: ['http://localhost:3000', 'https://keikodev.es'],
    credentials: true
  }));
  
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/socket.io')) {
      return res.status(204).end();
    }
    next();
  });
// Middlewares
app.use(suspiciousRouteLogger);
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://apis.google.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://*'],
      connectSrc: ["'self'", 'https://free.keikodev.es', 'https://keikodev.es'],
    },
  },
  referrerPolicy: { policy: 'no-referrer-when-downgrade' },
  crossOriginEmbedderPolicy: false,
}));

app.use(secureHeaders); // 🛡️ Añade cabeceras de seguridad personalizadas
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
app.use('/api/series/categories', seriesCategoryRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/admin/suspicious-access', adminSuspiciousRoutes);
app.use('/api/admin/rate-limit-blocks', rateLimitBlockRoutes);
app.use('/api', adminEnrichRoute);
app.use('/api/spacex', spacexPublicRoutes);
app.use('/api/admin', spacexAdminRoutes);
app.use('/api', linkAnalysisRoutes);
app.use('/api/admin', adminLinkAnalysisRoutes);
app.use('/api/pro', proLinkAnalysisRoutes);




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
import './jobs/syncWeeklyTop.js'; // activa el cronjob semanal
startEnrichSpacexJob();
// import './jobs/index.js';


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
