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
import ViralShorts from './pages/ViralShorts';
import CorelDrawCursoPage from './pages/CorelDrawCursoPage';
import SpaceXPage from './pages/SpaceXPage';
import EmailContextAdmin from './components/EmailContextAdmin';
import ScamPostsPage from './pages/ScamPostsPage';
import ScamPostDetailPage from './pages/ScamPostDetailPage';
import EmailReviewPage from './pages/admin/EmailReviewPage';
import ArticleReviewPage from './pages/ArticleReviewPage.jsx';
import HerramientasIA from './pages/HerramientasIA';
import EmailVerificationHandler from './pages/EmailVerificationHandler';
import VerifySuccessPage from './pages/VerifySuccessPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminUsersPage from './pages/AdminUsersPage';
import SocialPostAdmin from './components/SocialPostAdmin';
import ViralShortsCategory from './pages/ViralShortsCategory'; // ajusta la ruta si está en otro lugar




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
            <Route path="/admin/short-categories" element={<AdminRoute><ShortCategoriesPage /></AdminRoute>} />
            <Route path="/admin/sync-shorts" element={<AdminRoute><SyncShortsPage /></AdminRoute>} />
            <Route path="/admin/email-contexts" element={<AdminRoute><EmailContextAdmin /></AdminRoute>} />
            <Route path="/admin/email-review" element={<AdminRoute><EmailReviewPage /></AdminRoute>} />
            <Route path="/admin/email-articles" element={<AdminRoute><ArticleReviewPage /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
            {/* <Route path="/admin/social-posts" element={<AdminRoute><div>Hola soy admin</div></AdminRoute>} /> */}
            <Route path="/admin/social-posts" element={<AdminRoute><SocialPostAdmin /></AdminRoute>} />
            {/* <Route path="/admin/social-posts" element={<SocialPostAdmin />} /> */}

            <Route path="/admin/scam-posts" element={<AdminRoute><ScamPostsPage /></AdminRoute>} />
            <Route path="category/:categoryName" element={<CategoryResourcesPage />} />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/media/fotos-universo" element={<FotosUniversoPage />} />
            <Route path="/media/videos-universo" element={<VideosUniversoPage />} />
            <Route path="/youtube-channels" element={<YouTubeChannelsPage />} />
            <Route path="/youtube-channels/:id" element={<ChannelVideosPage />} />
            <Route path="viral-shorts" element={<ViralShorts />} /> {/* 👈 Nueva ruta */}
            <Route path="/viral-shorts/:categoryId" element={<ViralShortsCategory />} />

            <Route path="training" element={<TrainingPage />} />
            <Route path="/curso/corel-draw" element={<CorelDrawCursoPage />} />
            <Route path="/spacex" element={<SpaceXPage />} />
            <Route path="/scam-posts" element={<ScamPostsPage />} />
            <Route path="/scam-posts/:id" element={<ScamPostDetailPage />} />
            <Route path="/herramientas-ia" element={<HerramientasIA />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<EmailVerificationHandler />} />
            <Route path="/verify-success" element={<VerifySuccessPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
          </Route>
          <Route path="/login" element={<LoginPage />} />
          

          {/* Ruta fuera del layout */}
         
        </Routes>
        
      </Router>

    </UserProvider>
  );
}

export default App;
