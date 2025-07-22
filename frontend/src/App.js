import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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
import LegalNotice from './pages/LegalNotice'; // ajusta la ruta si es necesario
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiesPolicy from './pages/CookiesPolicy';
import AnimePromptGenerator from './components/AnimePromptGenerator';
import AnimePromptOptionsPage from './pages/AnimePromptOptionsPage';
import AffiliateLinksAdmin from './components/AffiliateLinksAdmin';
import AffiliateClickStatsAdmin from './components/AffiliateClickStatsAdmin';
import IgraalDealsAdmin from './components/IgraalDealsAdmin';
import IgraalDealsPage from './components/IgraalDealsPage';
import IgraalCouponsPage from './components/IgraalCouponsPage';
import IgraalCouponAdmin from './components/IgraalCouponAdmin';
import TopSeriesSyncPage from './pages/admin/TopSeriesSyncPage';
import TopSeriesHistoryPage from './pages/admin/TopSeriesHistoryPage';
import SerieDetalle from './pages/SerieDetalle'; // Asegúrate de tenerlo
import SeriesCategoryList from './pages/SeriesCategoryList';
import CategorySeriesPage from './pages/CategorySeriesPage';
import SuspiciousAccessAdmin from './components/SuspiciousAccessAdmin';
import LaunchDetail from './pages/LaunchDetail';
import SpacexLaunchAdmin from './pages/admin/SpacexLaunchAdmin';
import AdminLinkAnalysis from './components/admin/AdminLinkAnalysis';
import UserLinkDetail from './components/UserLinkDetail';
import UserLinkHistory from './components/UserLinkHistory';
import YouTubeLandingPage from './pages/YouTubeLandingPage.jsx'
import UserProfile from './pages/UserProfile';
import SeriesFilteredList from './pages/SeriesFilteredList';
import { TokenProvider } from './context/TokenContext';
import KeikoPromptPacks from './components/KeikoPromptPacks';
import KeikoPromptsList from './components/KeikoPromptsList';
import KeikoPromptPacksAdmin from './components/admin/KeikoPromptPacksAdmin';
import KeikoPromptsAdmin from './components/admin/KeikoPromptsAdmin';
import AdminImport from './components/admin/AdminImport';
import DuplicateCleanup from './components/admin/DuplicateCleanup';
import MotoGPCircuitMobileView from './components/MotoGPCircuitMobileView';
import MotoGPCalendarPage from './pages/MotoGPCalendar'; // ⚠️ Ajusta la ruta si va en otro sitio
import MotoGPCircuitPage from './pages/MotoGPCircuitPage';
import UserImageGallery from './components/UserImageGallery';
import RegisterLogsTable from './components/admin/RegisterLogsTable';
import TokenInfoPage from './pages/TokenInfoPage';
import KeikoIAGallery from './pages/KeikoIAGallery';
import PackImages from './components/PackImages';
import Imagenes from './pages/EdicionImagenes';
import AuthCallback from './components/AuthCallback';
import PrivateRoute from './components/PrivateRoute';
import CompresorImagenes from './pages/CompresorImagenes';
import RedimensionadorImagenes from "./pages/RedimensionadorImagenes";
import ConvertidorImagenes from "./pages/ConvertidorImagenes";
import CapturaDesdeURL from "./pages/CapturaDesdeURL";
import DescargasPage from './pages/DescargasPage';
import AdminTempFiles from './components/AdminTempFiles';
import GifsPage from './pages/GifsPage';
import MisFavoritos from './components/MisFavoritos';
import FutbolPage from './pages/FutbolPage';
import LaLigaPage from './pages/futbol/LaLigaPage';
            



import MarcaDeAgua from "./pages/MarcaDeAgua";
import BlogList from "./pages/BlogList";
import BlogPost from "./pages/BlogPost";

import BlogAdmin from "./pages/admin/BlogAdmin";
import BlogCreate from "./pages/admin/BlogCreate";
import BlogEdit from "./pages/admin/BlogEdit";

import KeikoRemoveBG from './pages/KeikoRemoveBG';
import SportsEventsAdminPage from './pages/admin/SportsEventsAdminPage';
import KeikoUpscale from './pages/KeikoUpscale'; // Ajusta ruta si es distinta
import PixeladorImagen from "./pages/PixeladorImagen";
import GiradorImagenes from "./pages/GiradorImagenes";
import RecortadorImagen from "./pages/RecortadorImagen"; // o el nombre que le hayas dado





function App() {
  return (
    
    <UserProvider>
      <TokenProvider>
      <Router>
        <Routes>
          {/* Rutas que comparten el layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/herramientas/descargas" element={<DescargasPage />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="ai-links" element={<AiLinksPage />} />
            <Route path="/aviso-legal" element={<LegalNotice />} />
            <Route path="/privacidad" element={<PrivacyPolicy />} />
            <Route path="/cookies" element={<CookiesPolicy />} />
            <Route path="admin/categories" element={<AdminRoute><CategoriesPage /></AdminRoute>} />
            <Route path="admin/ai-tools" element={<AdminRoute><AiToolsAdminPage /></AdminRoute>}/>
            <Route path="/admin/nasa-fechas" element={<AdminRoute><NasaFetchMonthPage /></AdminRoute>} />
            <Route path="/admin/training" element={<AdminRoute><TrainingAdminPage /></AdminRoute>} />
            <Route path="/admin/short-categories" element={<AdminRoute><ShortCategoriesPage /></AdminRoute>} />
            <Route path="/admin/sync-shorts" element={<AdminRoute><SyncShortsPage /></AdminRoute>} />
            <Route path="/admin/email-contexts" element={<AdminRoute><EmailContextAdmin /></AdminRoute>} />
            <Route path="/admin/email-review" element={<AdminRoute><EmailReviewPage /></AdminRoute>} />
            <Route path="/admin/email-articles" element={<AdminRoute><ArticleReviewPage /></AdminRoute>} />
            <Route path="/admin/sports-events" element={<AdminRoute><SportsEventsAdminPage /></AdminRoute>} />
            <Route path="/admin/temp-files" element={<AdminRoute><AdminTempFiles /></AdminRoute>} />
            {/* <Route path="/admin/sports-events" element={<SportsEventsAdminPage />} /> */}

            <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
            <Route path="/admin/anime-options" element={<AnimePromptOptionsPage />} />
            <Route path="/admin/affiliate-links" element={<AffiliateLinksAdmin />} />
            <Route path="/admin/igraal-coupons" element={<IgraalCouponAdmin />} />
            {/* <Route path="/generador-anime-prompts" element={<AdminRoute><AnimePromptGenerator /></AdminRoute>} /> */}
            <Route path="/generador-anime-prompts" element={<AnimePromptGenerator />} />
            <Route path="/admin/igraal-deals" element={<AdminRoute><IgraalDealsAdmin /></AdminRoute> }/>
            <Route path="/admin/top-series-history" element={<AdminRoute><TopSeriesHistoryPage /></AdminRoute>} />
            <Route path="/series/:tmdbId" element={<SerieDetalle />} />
            <Route path="/series/estado/:status" element={<SeriesFilteredList />} />
            <Route path="/series" element={<SeriesCategoryList />} />
            <Route path="/admin/spacex" element={<SpacexLaunchAdmin />} />
            <Route path="/perfil" element={<PrivateRoute><UserProfile /></PrivateRoute>} />

            <Route path="/admin/top-series-sync" element={<TopSeriesSyncPage />} />
            {/* <Route path="/admin/social-posts" element={<AdminRoute><div>Hola soy admin</div></AdminRoute>} /> */}
            <Route path="/admin/social-posts" element={<AdminRoute><SocialPostAdmin /></AdminRoute>} />
            <Route path="/admin/affiliate-clicks" element={<AdminRoute><AffiliateClickStatsAdmin /></AdminRoute>}
            />
            {/* <Route path="/admin/social-posts" element={<SocialPostAdmin />} /> */}
            <Route path="/admin/suspicious-access" element={<AdminRoute><SuspiciousAccessAdmin /></AdminRoute>} />
            <Route path="/admin/scam-posts" element={<AdminRoute><ScamPostsPage /></AdminRoute>} />
            <Route path="category/:categoryName" element={<CategoryResourcesPage />} />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/media/fotos-universo" element={<FotosUniversoPage />} />
            <Route path="/media/videos-universo" element={<VideosUniversoPage />} />
            <Route path="/youtube-channels" element={<YouTubeChannelsPage />} />
            <Route path="/youtube-channels/:id" element={<ChannelVideosPage />} />
            <Route path="viral-shorts" element={<ViralShorts />} /> {/* 👈 Nueva ruta */}
            <Route path="/viral-shorts/:categoryId" element={<ViralShortsCategory />} />
            <Route path="/launch/:id" element={<LaunchDetail />} />
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
            <Route path="/chollos" element={<IgraalDealsPage />} />
            <Route path="/cupones" element={<IgraalCouponsPage />} />
            <Route path="/series/categoria/:slug" element={<CategorySeriesPage />} />
            <Route path="/admin/link-analysis" element={<AdminLinkAnalysis />} />
            <Route path="/pro/link-analysis/:id" element={<UserLinkDetail />} />
            <Route path="/panel/pro/historial" element={<UserLinkHistory />} />
            <Route path="/youtube-uploader" element={<YouTubeLandingPage />} />
            <Route path="/keiko-remove-bg" element={<KeikoRemoveBG />} />
            <Route path="/edicion-imagenes" element={<Imagenes />} />
            <Route path="/redimensionar-imagenes" element={<RedimensionadorImagenes />} />
            <Route path="/pixelar-zona" element={<PixeladorImagen />} />
            <Route path="/rotate" element={<GiradorImagenes />} />
            <Route path="/crop" element={<RecortadorImagen />} />
            <Route path="/captura-url" element={<CapturaDesdeURL />} />
            

            <Route path="/convertir-imagenes" element={<ConvertidorImagenes />} />

            <Route path="/marca-de-agua" element={<MarcaDeAgua />} />
            
            {/* <Route path="/keikoprompts" element={<KeikoPromptPacks />} /> */}
            <Route path="/prompts/:packId" element={<KeikoPromptsList />} />

            <Route path="/admin/keiko-packs" element={<KeikoPromptPacksAdmin />} />
            <Route path="/admin/keiko-prompts" element={<KeikoPromptsAdmin />} />
            <Route path="/keikoprompts" element={<KeikoPromptPacks />} />
            <Route path="/admin/imports" element={<AdminImport />} />
            <Route path="/admin/DuplicateCleanup" element={<DuplicateCleanup />} />
            <Route path="/motogp-calendar" element={<MotoGPCalendarPage />} />
            <Route path="/motogp/:slug" element={<MotoGPCircuitPage />} />
            <Route path="/mis-imagenes" element={<UserImageGallery />} />
            <Route path="/admin/register-logs" element={<RegisterLogsTable />} />
            <Route path="/info/tokens" element={<TokenInfoPage />} />
            <Route path="/multimedia/keikoia" element={<KeikoIAGallery />} />
            <Route path="/biblioteca/pack/:packId" element={<PackImages />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/upscale" element={<KeikoUpscale />} />
            
            <Route path="/admin/blog" element={<AdminRoute><BlogAdmin /></AdminRoute>} />
            <Route path="/admin/blog/create" element={<AdminRoute><BlogCreate /></AdminRoute>} />
            <Route path="/admin/blog/edit/:id" element={<AdminRoute><BlogEdit /></AdminRoute>} />
            <Route path="/compresor-imagenes" element={<CompresorImagenes />} />
            <Route path="/gifs" element={<GifsPage />} />
            <Route path="/mis-favoritos" element={<MisFavoritos />} />
            <Route path="/futbol" element={<FutbolPage />} />
            <Route path="/futbol/laliga" element={<LaLigaPage />} /> 
            
            
          </Route>
          <Route path="/motogp-live" element={<MotoGPCircuitMobileView />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Ruta fuera del layout */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </Router>
      </TokenProvider>
    </UserProvider>
  );
}

export default App;
