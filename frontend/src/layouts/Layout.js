  import React from 'react';
  import { useState } from 'react';
  import { Link, Outlet, useNavigate } from 'react-router-dom';
  import Navbar from '../components/Navbar';
  import Footer from '../components/Footer';
  import { FaBook, FaRobot, FaYoutube, FaFileAlt, FaImage, FaGraduationCap, FaRocket, FaShieldVirus, FaMagic, FaGift, FaTicketAlt, FaTv, FaBoxes, FaCut  } from 'react-icons/fa';
  import '../styles/HomePage.css';
  import CookieConsentBanner from '../components/CookieConsentBanner';
  import AnalyticsLoader from '../components/AnalyticsLoader';
  import { useLocation } from 'react-router-dom';
  import AffiliatePopup from '../components/AffiliatePopup';
  import AffiliateBannerAndSidebar from '../components/AffiliateBannerAndSidebar';
  import { FaDownload, FaSmileBeam } from 'react-icons/fa';
  import { useUser } from '../context/UserContext';

  function Layout() {
    const { user } = useUser();
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const handleStart = () => {
      sessionStorage.setItem('scrollToPromptSection', 'true');
      navigate('/keikoprompts');
    };
    const sections = [
    // 🔥 Inicio atractivo (alto interés / engagement)
    {
      title: 'Edición de Imágenes',
      description: 'Herramientas para editar y mejorar tus imágenes con IA',
      path: '/edicion-imagenes',
      icon: <FaCut />,
    },
    { title: 'MultiMedia', description: 'Imágenes del universo, los mejores vídeos, todo Multimedia', path: '/media', icon: <FaImage /> },
    { title: 'Videos Virales', description: 'Los mejores Shorts organizados por categoría', path: '/viral-shorts', icon: <FaFileAlt /> },
    { title: 'YouTube Uploader', description: 'Sube y programa tus creaciones! Verán la luz cuando tu decidas', path: '/youtube-uploader', icon: <FaYoutube /> },
    // { title: 'Anime Prompts', description: 'Generador de prompts IA con personajes anime', path: '/generador-anime-prompts', icon: <FaMagic /> },
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
    { title: 'Chollos iGraal', description: 'Ofertas con cashback actualizadas a diario', path: '/chollos', icon: <FaGift /> },

    { title: 'MotoGP', description: 'Calendario completo de MotoGP por circuito', path: '/motogp-calendar', icon: <FaRocket /> },  // Puedes cambiar el icono
    { title: 'Blog Keiko', description: 'Entradas destacadas y novedades IA', path: '/blog', icon: <FaBook /> },
    { title: 'Keiko Gifs', description: 'Los mejores Gifs por gentileza de Tenor', path: '/gifs', icon: <FaSmileBeam /> },
    {
      title: 'Apoya el Proyecto',
      description: 'Completa encuestas para ayudarnos y gana créditos',
      path: '/apoyar',
      icon: <FaGift />
    },

    {
      title: 'Fútbol',
      description: 'Partidos, goleadores y estadísticas actualizadas',
      path: '/futbol',
      icon: <FaRocket /> // Puedes cambiarlo por otro como FaFutbol si lo tienes
    },
    
    

  ];
  if (user?.role === 'admin') {
    sections.push(
      {
        title: 'Descargador de Videos',
        description: 'Extrae videos y audios desde YouTube, Instagram, TikTok y más',
        path: '/herramientas/descargas',
        icon: <FaDownload />
      },
      {
      title: 'Anime Prompts',
      description: 'Generador de prompts IA con personajes anime',
      path: '/generador-anime-prompts',
      icon: <FaMagic />
    });
  }

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
        
        
        {/* SOLO visible en móvil */}
        <div className="mobile-only mobile-menu-toggle">
          <button onClick={() => setMenuOpen(!menuOpen)} className="menu-toggle-btn">
            {menuOpen ? '▲ Ocultar Menú' : '▼ Mostrar Menú'}
          </button>
        </div>

        {/* El menú: ocultar/mostrar solo en móvil */}
        <div className={`menu-bar ${menuOpen ? 'show' : 'hide'}`}>
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
            
        <div className="home-intro">
          <h2>🎨 Crea imágenes increíbles con IA</h2>
          <img
            src="https://res.cloudinary.com/dhoaeyjpt/image/upload/v1751195850/keikoprompts/KeikoLover/2025-06-29/KeikoLover_00515_.png"
            alt="Ejemplo de imagen IA"
            className="intro-image"
          />
          <p>Prueba KeikoPrompts y genera tu primera imagen en segundos. ¡Gratis!</p>
          <button className="cta-button" onClick={handleStart}>
            Empezar ahora
          </button>
        </div>

        <main className="layout-content">
          <AffiliateBannerAndSidebar />
          <Outlet />
          
          
        </main>

        <Footer />
        <CookieConsentBanner />
        <AnalyticsLoader />
      </div>
    );
  }

  export default Layout;
