import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { UserProvider } from './context/UserContext';
import { TokenProvider } from './context/TokenContext';
import Layout from './layouts/Layout';
import AdminRoute from './components/AdminRoute';
import PrivateRoute from './components/PrivateRoute';

const RouteFallback = <div className="route-loading">Cargando…</div>;

// Público
const HomePage = lazy(() => import('./pages/HomePage'));
const ThreeDPrintsPage = lazy(() => import('./pages/ThreeDPrintsPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const CategoryResourcesPage = lazy(() => import('./pages/CategoryResourcesPage'));
const AiLinksPage = lazy(() => import('./pages/AiLinksPage'));
const MediaPage = lazy(() => import('./pages/MediaPage'));
const FotosUniversoPage = lazy(() => import('./pages/FotosUniversoPage'));
const VideosUniversoPage = lazy(() => import('./pages/VideosUniversoPage'));
const YouTubeChannelsPage = lazy(() => import('./pages/YouTubeChannelsPage'));
const ChannelVideosPage = lazy(() => import('./pages/ChannelVideosPage'));
const ViralShorts = lazy(() => import('./pages/ViralShorts'));
const ViralShortsCategory = lazy(() => import('./pages/ViralShortsCategory'));
const LaunchDetail = lazy(() => import('./pages/LaunchDetail'));
const TrainingPage = lazy(() => import('./pages/TrainingPage'));
const CorelDrawCursoPage = lazy(() => import('./pages/CorelDrawCursoPage'));
const SpaceXPage = lazy(() => import('./pages/SpaceXPage'));
const ScamPostsPage = lazy(() => import('./pages/ScamPostsPage'));
const ScamPostDetailPage = lazy(() => import('./pages/ScamPostDetailPage'));
const HerramientasIA = lazy(() => import('./pages/HerramientasIA'));
const IgraalDealsPage = lazy(() => import('./components/IgraalDealsPage'));
const IgraalCouponsPage = lazy(() => import('./components/IgraalCouponsPage'));
const SerieDetalle = lazy(() => import('./pages/SerieDetalle'));
const SeriesFilteredList = lazy(() => import('./pages/SeriesFilteredList'));
const SeriesCategoryList = lazy(() => import('./pages/SeriesCategoryList'));
const CategorySeriesPage = lazy(() => import('./pages/CategorySeriesPage'));
const YouTubeLandingPage = lazy(() => import('./pages/YouTubeLandingPage.jsx'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const UserImageGallery = lazy(() => import('./components/UserImageGallery'));
const TokenInfoPage = lazy(() => import('./pages/TokenInfoPage'));
const KeikoIAGallery = lazy(() => import('./pages/KeikoIAGallery'));
const PackImages = lazy(() => import('./components/PackImages'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const GifsPage = lazy(() => import('./pages/GifsPage'));
const MisFavoritos = lazy(() => import('./components/MisFavoritos'));
const FutbolPage = lazy(() => import('./pages/FutbolPage'));
const LaLigaPage = lazy(() => import('./pages/futbol/LaLigaPage'));
const ChampionsPage = lazy(() => import('./pages/futbol/ChampionsPage'));
const LegalNotice = lazy(() => import('./pages/LegalNotice'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const CookiesPolicy = lazy(() => import('./pages/CookiesPolicy'));
const DescargasPage = lazy(() => import('./pages/DescargasPage'));
const Apoyar = lazy(() => import('./components/Apoyar'));

// Auth
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const EmailVerificationHandler = lazy(() => import('./pages/EmailVerificationHandler'));
const VerifySuccessPage = lazy(() => import('./pages/VerifySuccessPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const AuthCallback = lazy(() => import('./components/AuthCallback'));

// Admin
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const AiToolsAdminPage = lazy(() => import('./pages/admin/AiToolsAdminPage'));
const NasaFetchMonthPage = lazy(() => import('./pages/admin/NasaFetchMonthPage'));
const TrainingAdminPage = lazy(() => import('./pages/admin/TrainingAdminPage'));
const ShortCategoriesPage = lazy(() => import('./pages/admin/ShortCategoriesPage'));
const SyncShortsPage = lazy(() => import('./pages/admin/SyncShortsPage'));
const EmailContextAdmin = lazy(() => import('./components/EmailContextAdmin'));
const EmailReviewPage = lazy(() => import('./pages/admin/EmailReviewPage'));
const ArticleReviewPage = lazy(() => import('./pages/ArticleReviewPage.jsx'));
const SportsEventsAdminPage = lazy(() => import('./pages/admin/SportsEventsAdminPage'));
const AdminTempFiles = lazy(() => import('./components/AdminTempFiles'));
const PromptImagesHistory = lazy(() => import('./components/PromptImagesHistory'));
const TextToImagePage = lazy(() => import('./pages/TextToImagePage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AnimePromptOptionsPage = lazy(() => import('./pages/AnimePromptOptionsPage'));
const AffiliateLinksAdmin = lazy(() => import('./components/AffiliateLinksAdmin'));
const IgraalCouponAdmin = lazy(() => import('./components/IgraalCouponAdmin'));
const AnimePromptGenerator = lazy(() => import('./components/AnimePromptGenerator'));
const IgraalDealsAdmin = lazy(() => import('./components/IgraalDealsAdmin'));
const TopSeriesHistoryPage = lazy(() => import('./pages/admin/TopSeriesHistoryPage'));
const SpacexLaunchAdmin = lazy(() => import('./pages/admin/SpacexLaunchAdmin'));
const TopSeriesSyncPage = lazy(() => import('./pages/admin/TopSeriesSyncPage'));
const SocialPostAdmin = lazy(() => import('./components/SocialPostAdmin'));
const AffiliateClickStatsAdmin = lazy(() => import('./components/AffiliateClickStatsAdmin'));
const AdminIGMonitorPage = lazy(() => import('./pages/AdminIGMonitorPage.jsx'));
const SuspiciousAccessAdmin = lazy(() => import('./components/SuspiciousAccessAdmin'));
const AdminLinkAnalysis = lazy(() => import('./components/admin/AdminLinkAnalysis'));
const KeikoPromptPacksAdmin = lazy(() => import('./components/admin/KeikoPromptPacksAdmin'));
const KeikoPromptsAdmin = lazy(() => import('./components/admin/KeikoPromptsAdmin'));
const AdminImport = lazy(() => import('./components/admin/AdminImport'));
const DuplicateCleanup = lazy(() => import('./components/admin/DuplicateCleanup'));
const RegisterLogsTable = lazy(() => import('./components/admin/RegisterLogsTable'));
const BlogAdmin = lazy(() => import('./pages/admin/BlogAdmin'));
const BlogCreate = lazy(() => import('./pages/admin/BlogCreate'));
const BlogEdit = lazy(() => import('./pages/admin/BlogEdit'));
const FilamentsAdminPage = lazy(() => import('./pages/admin/FilamentsAdminPage'));
const Models3DAdminPage = lazy(() => import('./pages/admin/Models3DAdminPage'));
const FilamentsPage = lazy(() => import('./pages/FilamentsPage'));
const FilamentDetailPage = lazy(() => import('./pages/FilamentDetailPage'));
const Models3DPage = lazy(() => import('./pages/Models3DPage'));
const Model3DDetailPage = lazy(() => import('./pages/Model3DDetailPage'));
const PrintCostCalculatorPage = lazy(() => import('./pages/PrintCostCalculatorPage'));

// Utilidades
const RedimensionadorImagenes = lazy(() => import('./pages/RedimensionadorImagenes'));
const ConvertidorImagenes = lazy(() => import('./pages/ConvertidorImagenes'));
const CapturaDesdeURL = lazy(() => import('./pages/CapturaDesdeURL'));
const Imagenes = lazy(() => import('./pages/EdicionImagenes'));
const CompresorImagenes = lazy(() => import('./pages/CompresorImagenes'));
const MarcaDeAgua = lazy(() => import('./pages/MarcaDeAgua'));
const PixeladorImagen = lazy(() => import('./pages/PixeladorImagen'));
const GiradorImagenes = lazy(() => import('./pages/GiradorImagenes'));
const RecortadorImagen = lazy(() => import('./pages/RecortadorImagen'));
const KeikoRemoveBG = lazy(() => import('./pages/KeikoRemoveBG'));
const KeikoUpscale = lazy(() => import('./pages/KeikoUpscale'));
const KeikoPromptPacks = lazy(() => import('./components/KeikoPromptPacks'));
const KeikoPromptsList = lazy(() => import('./components/KeikoPromptsList'));
const EntrenaGenerador = lazy(() => import('./pages/EntrenaGenerador.jsx'));
const UserLinkDetail = lazy(() => import('./components/UserLinkDetail'));
const UserLinkHistory = lazy(() => import('./components/UserLinkHistory'));

function App() {
  return (
    <UserProvider>
      <TokenProvider>
        <Router>
          <Suspense fallback={RouteFallback}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="/herramientas/descargas" element={<DescargasPage />} />
                <Route path="resources" element={<ResourcesPage />} />
                <Route path="ai-links" element={<AiLinksPage />} />
                <Route path="/aviso-legal" element={<LegalNotice />} />
                <Route path="/privacidad" element={<PrivacyPolicy />} />
                <Route path="/cookies" element={<CookiesPolicy />} />
                <Route path="admin/categories" element={<AdminRoute><CategoriesPage /></AdminRoute>} />
                <Route path="admin/ai-tools" element={<AdminRoute><AiToolsAdminPage /></AdminRoute>} />
                <Route path="/admin/nasa-fechas" element={<AdminRoute><NasaFetchMonthPage /></AdminRoute>} />
                <Route path="/admin/training" element={<AdminRoute><TrainingAdminPage /></AdminRoute>} />
                <Route path="/admin/short-categories" element={<AdminRoute><ShortCategoriesPage /></AdminRoute>} />
                <Route path="/admin/sync-shorts" element={<AdminRoute><SyncShortsPage /></AdminRoute>} />
                <Route path="/admin/email-contexts" element={<AdminRoute><EmailContextAdmin /></AdminRoute>} />
                <Route path="/admin/email-review" element={<AdminRoute><EmailReviewPage /></AdminRoute>} />
                <Route path="/admin/email-articles" element={<AdminRoute><ArticleReviewPage /></AdminRoute>} />
                <Route path="/admin/sports-events" element={<AdminRoute><SportsEventsAdminPage /></AdminRoute>} />
                <Route path="/admin/temp-files" element={<AdminRoute><AdminTempFiles /></AdminRoute>} />
                <Route path="/keikoprompts/historial/:promptId" element={<PromptImagesHistory />} />
                <Route path="/texto-a-imagen" element={<TextToImagePage />} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
                <Route path="/admin/anime-options" element={<AdminRoute><AnimePromptOptionsPage /></AdminRoute>} />
                <Route path="/admin/affiliate-links" element={<AdminRoute><AffiliateLinksAdmin /></AdminRoute>} />
                <Route path="/admin/igraal-coupons" element={<AdminRoute><IgraalCouponAdmin /></AdminRoute>} />
                <Route path="/generador-anime-prompts" element={<AnimePromptGenerator />} />
                <Route path="/admin/igraal-deals" element={<AdminRoute><IgraalDealsAdmin /></AdminRoute>} />
                <Route path="/admin/top-series-history" element={<AdminRoute><TopSeriesHistoryPage /></AdminRoute>} />
                <Route path="/series/:tmdbId" element={<SerieDetalle />} />
                <Route path="/series/estado/:status" element={<SeriesFilteredList />} />
                <Route path="/series" element={<SeriesCategoryList />} />
                <Route path="/admin/spacex" element={<AdminRoute><SpacexLaunchAdmin /></AdminRoute>} />
                <Route path="/perfil" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
                <Route path="/apoyar" element={<Apoyar />} />
                <Route path="/admin/top-series-sync" element={<AdminRoute><TopSeriesSyncPage /></AdminRoute>} />
                <Route path="/admin/social-posts" element={<AdminRoute><SocialPostAdmin /></AdminRoute>} />
                <Route path="/admin/affiliate-clicks" element={<AdminRoute><AffiliateClickStatsAdmin /></AdminRoute>} />
                <Route path="/admin/ig-monitor" element={<AdminRoute><AdminIGMonitorPage /></AdminRoute>} />
                <Route path="/admin/suspicious-access" element={<AdminRoute><SuspiciousAccessAdmin /></AdminRoute>} />
                <Route path="/admin/scam-posts" element={<AdminRoute><ScamPostsPage /></AdminRoute>} />
                <Route path="category/:categoryName" element={<CategoryResourcesPage />} />
                <Route path="/media" element={<MediaPage />} />
                <Route path="/media/fotos-universo" element={<FotosUniversoPage />} />
                <Route path="/media/videos-universo" element={<VideosUniversoPage />} />
                <Route path="/youtube-channels" element={<YouTubeChannelsPage />} />
                <Route path="/youtube-channels/:id" element={<ChannelVideosPage />} />
                <Route path="viral-shorts" element={<ViralShorts />} />
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
                <Route path="/admin/link-analysis" element={<AdminRoute><AdminLinkAnalysis /></AdminRoute>} />
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
                <Route path="/entrena-generador" element={<EntrenaGenerador />} />
                <Route path="/convertir-imagenes" element={<ConvertidorImagenes />} />
                <Route path="/marca-de-agua" element={<MarcaDeAgua />} />
                <Route path="/prompts/:packId" element={<KeikoPromptsList />} />
                <Route path="/admin/keiko-packs" element={<AdminRoute><KeikoPromptPacksAdmin /></AdminRoute>} />
                <Route path="/admin/keiko-prompts" element={<AdminRoute><KeikoPromptsAdmin /></AdminRoute>} />
                <Route path="/keikoprompts" element={<KeikoPromptPacks />} />
                <Route path="/3dprints-keiko" element={<ThreeDPrintsPage />} />
                <Route path="/3dprints-keiko/filamentos" element={<FilamentsPage />} />
                <Route path="/3dprints-keiko/filamentos/:slug" element={<FilamentDetailPage />} />
                <Route path="/3dprints-keiko/modelos" element={<Models3DPage />} />
                <Route path="/3dprints-keiko/modelos/:slug" element={<Model3DDetailPage />} />
                <Route path="/3dprints-keiko/calculadora-costes" element={<PrintCostCalculatorPage />} />
                <Route path="/admin/filaments" element={<AdminRoute><FilamentsAdminPage /></AdminRoute>} />
                <Route path="/admin/models-3d" element={<AdminRoute><Models3DAdminPage /></AdminRoute>} />
                <Route path="/admin/imports" element={<AdminRoute><AdminImport /></AdminRoute>} />
                <Route path="/admin/DuplicateCleanup" element={<AdminRoute><DuplicateCleanup /></AdminRoute>} />
                <Route path="/mis-imagenes" element={<UserImageGallery />} />
                <Route path="/admin/register-logs" element={<AdminRoute><RegisterLogsTable /></AdminRoute>} />
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
                <Route path="/futbol/champions" element={<ChampionsPage />} />
              </Route>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </Suspense>
        </Router>
      </TokenProvider>
    </UserProvider>
  );
}

export default App;
