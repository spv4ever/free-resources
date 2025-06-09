import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaBook, FaRobot, FaYoutube, FaFileAlt, FaImage, FaGraduationCap, FaRocket, FaShieldVirus, FaMagic, FaGift, FaTicketAlt, FaTv, FaBoxes  } from 'react-icons/fa';
import '../styles/HomePage.css';
import CookieConsentBanner from '../components/CookieConsentBanner';
import AnalyticsLoader from '../components/AnalyticsLoader';
import { useLocation } from 'react-router-dom';
import AffiliatePopup from '../components/AffiliatePopup';
import AffiliateBannerAndSidebar from '../components/AffiliateBannerAndSidebar';
// import { useUser } from '../context/UserContext';

function Layout() {
  // const { user } = useUser();
  const location = useLocation();
  const sections = [
  // 🔥 Inicio atractivo (alto interés / engagement)
  { title: 'MultiMedia', description: 'Imágenes del universo, los mejores vídeos, todo Multimedia', path: '/media', icon: <FaImage /> },
  { title: 'Videos Virales', description: 'Los mejores Shorts organizados por categoría', path: '/viral-shorts', icon: <FaFileAlt /> },
  { title: 'YouTube Uploader', description: 'Sube y programa tus creaciones! Verán la luz cuando tu decidas', path: '/youtube-uploader', icon: <FaYoutube /> },
  { title: 'Anime Prompts', description: 'Generador de prompts IA con personajes anime', path: '/generador-anime-prompts', icon: <FaMagic /> },
  { title: 'KeikoPrompts', description: 'Explora nuestros packs de prompts para IA, listos para usar.', path: '/keikoprompts', icon: <FaBoxes /> },
  { title: 'AI Links', description: 'Lista de herramientas de inteligencia artificial.', path: '/ai-links', icon: <FaRobot /> },

  // 🎓 Valor educativo / útil
  { title: 'Recursos', description: 'Accede a nuestra biblioteca de imágenes y recursos.', path: '/resources', icon: <FaBook /> },
  { title: 'Formación', description: 'Recursos gratuitos para aprender.', path: '/training', icon: <FaGraduationCap /> },
  { title: 'Series', description: 'Explora el catálogo de series por categorías', path: '/series', icon: <FaTv /> },

  // 🚀 Temáticas especializadas
  { title: 'SpaceX', description: 'Todo lo relacionado con los lanzamientos de SpaceX. Rumbo a Marte', path: '/spacex', icon: <FaRocket /> },
  { title: 'CiberEstafas', description: 'Todo lo relacionado Noticias sobre ciberestafas.', path: '/scam-posts', icon: <FaShieldVirus /> },

  // 💰 Ofertas y monetización
  { title: 'Cupones iGraal', description: 'Códigos descuento + cashback real', path: '/cupones', icon: <FaTicketAlt /> },
  { title: 'Chollos iGraal', description: 'Ofertas con cashback actualizadas a diario', path: '/chollos', icon: <FaGift /> }
];


  // // 🔐 Añadir solo si es usuario PRO
  
  //   sections.push({
  //     title: 'Anime Prompts',
  //     description: 'Generador de prompts IA con personajes anime',
  //     path: '/generador-anime-prompts',
  //     icon: <FaMagic />
  //   });
  

  return (
    <div className="layout-container">
      <AffiliatePopup currentPath={location.pathname} />
      
      <Navbar />

      <div className="menu-bar">
        {sections.map((section, index) => (
          <Link
            key={index}
            to={section.path}
            className="menu-button"
            title={section.description}
          >
            <span className="menu-icon">{section.icon}</span>
            <span>{section.title}</span>
          </Link>
        ))}
      </div>

      <main className="layout-content">
        <Outlet />
        <AffiliateBannerAndSidebar />
      </main>

      <Footer />
      <CookieConsentBanner />
      <AnalyticsLoader />
    </div>
  );
}

export default Layout;
