import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
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




 // 👈 Importa las rutas de autenticación

dotenv.config();

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'https://free.keikodev.es'],
    credentials: true
  }));
  

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
fetchNasaImageDaily();

//fetchTodayImage();

// Rutas
app.use('/api/resources', resourceLibraryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/aitools', aiToolRoutes);
app.use('/api/nasa-images', nasaImageRoutes);
app.use('/api/admin', adminToolsRoutes);
app.use('/api/youtube-channels', youtubeChannelRoutes);
app.use('/api/training-resources', trainingResourceRoutes);
app.use('/api/short-categories', shortCategoryRoutes);
app.use('/api/viral-shorts', viralShortRoutes);
app.use('/api/spacex', spacexRoutes);
app.use('/api/spacex', spacexRoutes);
app.use('/api/gmail', gmailRoutes);

import './jobs/spaceXJob.js';


// // Ruta de prueba
// app.get('/', (req, res) => {
//   res.send('API funcionando correctamente 🚀');
// });
app.get('/', (req, res) => {
    res.send('🚀 API de KeikoDev activa');
  });
// Middleware de ruta no encontrada
app.use(notFound);

// Middleware de manejo de errores
app.use(errorHandler);

// Exportar app
export default app;
