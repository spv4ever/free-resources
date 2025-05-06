import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import HomePage from './pages/HomePage';
import ResourcesPage from './pages/ResourcesPage';
import LoginPage from './pages/LoginPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import Layout from './layouts/Layout'; // 👈 nuevo layout con navbar + menú
import CategoryResourcesPage from './pages/CategoryResourcesPage';
import AiLinksPage from './pages/AiLinksPage';
import AiToolsAdminPage from './pages/admin/AiToolsAdminPage';
import AdminRoute from './components/AdminRoute';
import MediaPage from './pages/MediaPage';
import FotosUniversoPage from './pages/FotosUniversoPage';
import VideosUniversoPage from './pages/VideosUniversoPage';
import NasaFetchMonthPage from './pages/admin/NasaFetchMonthPage';
import YouTubeChannelsPage from './pages/YouTubeChannelsPage';
import ChannelVideosPage from './pages/ChannelVideosPage';
import TrainingAdminPage from './pages/admin/TrainingAdminPage';
import TrainingPage from './pages/TrainingPage';
import ShortCategoriesPage from './pages/admin/ShortCategoriesPage';
import SyncShortsPage from './pages/admin/SyncShortsPage'; // si lo vas a separar
import ViralShortsPage from './pages/ViralShortsPage';
import CorelDrawCursoPage from './pages/CorelDrawCursoPage';
import SpaceXPage from './pages/SpaceXPage';




function App() {
  return (
    
    <UserProvider>
      
      <Router>
      
        <Routes>
        
          {/* Rutas que comparten el layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="ai-links" element={<AiLinksPage />} />
            <Route path="admin/categories" element={<AdminRoute><CategoriesPage /></AdminRoute>} />
            <Route path="admin/ai-tools" element={<AdminRoute><AiToolsAdminPage /></AdminRoute>}/>
            <Route path="/admin/nasa-fechas" element={<AdminRoute><NasaFetchMonthPage /></AdminRoute>} />
            <Route path="/admin/training" element={<AdminRoute><TrainingAdminPage /></AdminRoute>} />
            <Route path="/admin/short-categories" element={<ShortCategoriesPage />} />
            <Route path="/admin/sync-shorts" element={<SyncShortsPage />} />
            <Route path="category/:categoryName" element={<CategoryResourcesPage />} />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/media/fotos-universo" element={<FotosUniversoPage />} />
            <Route path="/media/videos-universo" element={<VideosUniversoPage />} />
            <Route path="/youtube-channels" element={<YouTubeChannelsPage />} />
            <Route path="/youtube-channels/:id" element={<ChannelVideosPage />} />
            <Route path="viral-shorts" element={<ViralShortsPage />} /> {/* 👈 Nueva ruta */}
            <Route path="training" element={<TrainingPage />} />
            <Route path="/curso/corel-draw" element={<CorelDrawCursoPage />} />
            <Route path="/spacex" element={<SpaceXPage />} />
          </Route>
          

          {/* Ruta fuera del layout */}
          <Route path="/login" element={<LoginPage />} />
        </Routes>
        
      </Router>

    </UserProvider>
  );
}

export default App;
