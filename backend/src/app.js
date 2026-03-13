import dotenv from 'dotenv';
dotenv.config();
import passport from 'passport';
import './config/passport.js'; // 👈 registra las estrategias (como google-free-resources)
import express from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import errorHandler from './middlewares/errorMiddleware.js';
import notFound from './middlewares/notFoundMiddleware.js';
import fetchNasaImageDaily from './jobs/fetchNasaImage.js';
import { fetchTodayImage } from './jobs/fetchNasaImage.js';
import { startMotoGPNotifier } from './services/motogp-notifier.js';
import { runScheduledImports } from './services/emailScheduler.js';
import { suspiciousRouteLogger } from './middlewares/suspiciousRoutes.js';
import { secureHeaders } from './middlewares/secureHeaders.js';
import { createRateLimiter } from './middlewares/rateLimitHandler.js';
import { startEnrichSpacexJob } from './jobs/enrichSpacexJob.js';
import { startComfySocketWatcher } from './services/comfySocketWatcher.js';
import { startDailyEventScheduler } from './notifier/coreScheduler.js';
import { startF1Notifier } from './services/f1-notifier.js';
import { limpiarDescargasTemporales } from './jobs/cleanupDownloads.js';
import { iniciarSchedulerFutbol } from './jobs/futbolScheduler.js';
import { scheduleIGDailyJob } from './jobs/igDailyJob.js';
import scheduleIGDailyCarouselJobAccount2 from './jobs/igDailyCarouselJob.account2.js';
import scheduleIGDailyReelJobAccount2 from './jobs/igDailyReelJob.account2.js';
import { bootWeeklyPlanner, rebuildWeeklyForAccount,startCronProbe,setWeeklyPlannerEnabled } from './jobs/WeeklyPlanner.js';
import { registerApiRoutes } from './routes/registerApiRoutes.js';





// Otras rutas...

 // 👈 Importa las rutas de autenticación

// 🔍 Diagnóstico de variables peligrosas en entorno Render
console.log('🔍 Verificando variables de entorno cargadas:');
Object.entries(process.env).forEach(([key, value]) => {
  if (typeof value === 'string' && value.match(/^\/?:|\/api\/:|\/:\//)) {
    console.error(`❌ Variable de entorno sospechosa: ${key} = ${value}`);
  }
});

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.set('trust proxy', 1); // necesario si usas proxy inverso como NGINX


app.use(session({
  secret: process.env.SESSION_SECRET || 'keikosecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // requiere HTTPS en prod
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 día
  }
}));

// Inicializar passport (👈 necesario para estrategias como Google)
app.use(passport.initialize());
console.log(`🌍 Entorno de ejecución: ${process.env.NODE_ENV || 'no definido'}`);

if (process.env.NODE_ENV === 'development') {
  console.log('🛠️ CORS configurado en modo DESARROLLO: se permite cualquier origen.');
} else {
  console.log('🔒 CORS en modo PRODUCCIÓN: solo se permiten orígenes explícitamente autorizados.');
}
// app.options('*', cors({
//   origin: ['https://keikodev.es'],
//   credentials: true
// }));



// // 🧱 Limitar peticiones por IP (protección básica anti-bots)
// const generalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutos
//   max: 100, // máximo 100 peticiones por IP
//   message: '⛔ Demasiadas peticiones desde esta IP, inténtalo más tarde.',
//   standardHeaders: true, 
//   legacyHeaders: false,
// });

// Limitar rutas sensibles
// app.use('/api/auth', createRateLimiter({ max: 30, windowMs: 15 * 60 * 1000 }));
// app.use('/api/upload', createRateLimiter({ max: 20, windowMs: 15 * 60 * 1000 }));
// app.use('/api/ai', createRateLimiter({ max: 40, windowMs: 15 * 60 * 1000 }));
// app.use('/api/admin', createRateLimiter({ max: 50, windowMs: 15 * 60 * 1000 }));

// app.use(generalLimiter);
const allowedOrigins = ['http://localhost:3000', 'https://keikodev.es',"https://nocf.keikodev.es"];



app.use(cors({
  origin: function (origin, callback) {
    if (process.env.NODE_ENV === 'development') {
      // En desarrollo, aceptar cualquier origen (útil para pruebas locales, extensiones, Postman)
      callback(null, true);
    } else {
      // En producción, solo aceptar orígenes permitidos explícitamente
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ Origen no permitido en producción: ${origin}`);
        callback(new Error('CORS not allowed'));
      }
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // <-- Agrega PATCH aquí
  credentials: true,
}));

// Añade este middleware justo después para el preflight OPTIONS
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', allowedOrigins.includes(req.headers.origin) ? req.headers.origin : '');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(204);
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
startMotoGPNotifier();
startF1Notifier();
startDailyEventScheduler(); // activa cron diario
iniciarSchedulerFutbol(process.env.MONGO_URI);
//fetchTodayImage();
export const initializePostStartTasks = async () => {
  // Encendido por .env, sin distinguir prod/dev
  const want = (process.env.WEEKLY_PLANNER_ENABLED || 'false') === 'true';
  setWeeklyPlannerEnabled(want);
  if (want) {
    await bootWeeklyPlanner();
    if (process.env.DEBUG_WEEKLY === '1') startCronProbe('Europe/Madrid');
  } else {
    console.log('⚠️ Weekly planner desactivado por .env');
  }
};
// Rutas
registerApiRoutes({ app, __dirname, rebuildWeeklyForAccount });


// app.use((req, res, next) => {
//   try {
//     decodeURIComponent(req.path); // si viene ruta malformada la pilla aquí
//     next();
//   } catch (err) {
//     console.error('❌ Ruta malformada detectada:', req.path);
//     res.status(400).send('Ruta no válida');
//   }
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
