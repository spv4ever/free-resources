import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FaBook,
  FaBoxes,
  FaCompass,
  FaCut,
  FaDownload,
  FaFileAlt,
  FaGift,
  FaGraduationCap,
  FaImage,
  FaMagic,
  FaRobot,
  FaRocket,
  FaShieldVirus,
  FaSmileBeam,
  FaTicketAlt,
  FaTv,
  FaYoutube,
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CookieConsentBanner from '../components/CookieConsentBanner';
import AnalyticsLoader from '../components/AnalyticsLoader';
import AffiliatePopup from '../components/AffiliatePopup';
import AffiliateBannerAndSidebar from '../components/AffiliateBannerAndSidebar';
import { useUser } from '../context/UserContext';
import '../styles/HomePage.css';

const THEME_STORAGE_KEY = 'keikodev-theme';

function Layout() {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [theme, setTheme] = useState('dark');
  const dropdownRef = useRef(null);
  const closeDropdownTimeoutRef = useRef(null);

  const handleStart = () => {
    sessionStorage.setItem('scrollToPromptSection', 'true');
    navigate('/keikoprompts');
  };

  const menuGroups = useMemo(() => {
    const groups = [
      {
        id: 'crear',
        label: 'Crear',
        align: 'start',
        description: 'Herramientas principales para crear, editar y publicar contenido.',
        items: [
          {
            title: 'Edición de Imágenes',
            description: 'Herramientas para editar y mejorar tus imágenes con IA.',
            path: '/edicion-imagenes',
            icon: <FaCut />,
          },
          {
            title: 'KeikoPrompts',
            description: 'Explora packs de prompts para IA listos para usar.',
            path: '/keikoprompts',
            icon: <FaBoxes />,
          },
          {
            title: 'Texto a Imagen',
            description: 'Genera imágenes desde prompt con diferentes LORAs.',
            path: '/texto-a-imagen',
            icon: <FaBoxes />,
          },
          {
            title: 'YouTube Uploader',
            description: 'Sube y programa tus creaciones cuando tú decidas.',
            path: '/youtube-uploader',
            icon: <FaYoutube />,
          },
        ],
      },
      {
        id: 'explorar',
        label: 'Explorar',
        align: 'start',
        description: 'Accesos rápidos a colecciones, medios y contenidos destacados.',
        items: [
          {
            title: 'MultiMedia',
            description: 'Imágenes del universo, vídeos y contenido multimedia.',
            path: '/media',
            icon: <FaImage />,
          },
          {
            title: 'Videos Virales',
            description: 'Los mejores shorts organizados por categoría.',
            path: '/viral-shorts',
            icon: <FaFileAlt />,
          },
          {
            title: 'Recursos',
            description: 'Accede a la biblioteca de imágenes y recursos.',
            path: '/resources',
            icon: <FaBook />,
          },
          {
            title: 'Formación',
            description: 'Recursos gratuitos para aprender y mejorar habilidades.',
            path: '/training',
            icon: <FaGraduationCap />,
          },
          {
            title: 'AI Links',
            description: 'Herramientas y enlaces útiles de inteligencia artificial.',
            path: '/ai-links',
            icon: <FaRobot />,
          },
          {
            title: 'Blog Keiko',
            description: 'Entradas destacadas, novedades y contenidos del proyecto.',
            path: '/blog',
            icon: <FaBook />,
          },
          {
            title: 'Keiko Gifs',
            description: 'Galería de GIFs seleccionados con Tenor.',
            path: '/gifs',
            icon: <FaSmileBeam />,
          },
        ],
      },
      {
        id: 'temas',
        label: 'Temas',
        align: 'start',
        description: 'Secciones temáticas con seguimiento y contenido especializado.',
        items: [
          {
            title: 'Series',
            description: 'Explora el catálogo de series por categorías.',
            path: '/series',
            icon: <FaTv />,
          },
          {
            title: 'Fútbol',
            description: 'Partidos, goleadores y estadísticas actualizadas.',
            path: '/futbol',
            icon: <FaCompass />,
          },
          {
            title: 'SpaceX',
            description: 'Lanzamientos, historia y actualidad espacial.',
            path: '/spacex',
            icon: <FaRocket />,
          },
          {
            title: 'CiberEstafas',
            description: 'Noticias y avisos relacionados con ciberestafas.',
            path: '/scam-posts',
            icon: <FaShieldVirus />,
          },
        ],
      },
      {
        id: 'comunidad',
        label: 'Comunidad',
        align: 'start',
        description: 'Ventajas, descuentos y recursos para la comunidad.',
        items: [
          {
            title: 'Cupones iGraal',
            description: 'Códigos descuento y cashback real.',
            path: '/cupones',
            icon: <FaTicketAlt />,
          },
          {
            title: 'Chollos iGraal',
            description: 'Ofertas con cashback actualizadas a diario.',
            path: '/chollos',
            icon: <FaGift />,
          },
        ],
      },
    ];

    if (user?.role === 'admin') {
      groups[0].items.push({
        title: 'Descargador de Videos',
        description: 'Extrae videos y audios desde YouTube, Instagram, TikTok y más.',
        path: '/herramientas/descargas',
        icon: <FaDownload />,
      });
      groups[0].items.push({
        title: 'Anime Prompts',
        description: 'Generador de prompts IA con personajes anime.',
        path: '/generador-anime-prompts',
        icon: <FaMagic />,
      });
    }

    return groups;
  }, [user]);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      return;
    }

    const preferredTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    setTheme(preferredTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', theme === 'dark' ? '#07111f' : '#edf4ff');
    }
  }, [theme]);

  useEffect(() => {
    setMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => () => {
    if (closeDropdownTimeoutRef.current) {
      clearTimeout(closeDropdownTimeoutRef.current);
    }
  }, []);

  const cancelDropdownClose = () => {
    if (closeDropdownTimeoutRef.current) {
      clearTimeout(closeDropdownTimeoutRef.current);
      closeDropdownTimeoutRef.current = null;
    }
  };

  const openDropdown = (groupId) => {
    cancelDropdownClose();
    setActiveDropdown(groupId);
  };

  const scheduleDropdownClose = (groupId) => {
    cancelDropdownClose();
    closeDropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown((current) => (current === groupId ? null : current));
      closeDropdownTimeoutRef.current = null;
    }, 220);
  };

  const handleDropdownBlur = (event, groupId) => {
    const nextFocusedElement = event.relatedTarget;

    if (event.currentTarget.contains(nextFocusedElement)) {
      return;
    }

    scheduleDropdownClose(groupId);
  };

  const toggleDropdown = (groupId) => {
    cancelDropdownClose();
    setActiveDropdown((current) => (current === groupId ? null : groupId));
  };

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="layout-container">
      <AffiliatePopup currentPath={location.pathname} />

      <Navbar
        menuGroups={menuGroups}
        activeDropdown={activeDropdown}
        openDropdown={openDropdown}
        scheduleDropdownClose={scheduleDropdownClose}
        handleDropdownBlur={handleDropdownBlur}
        toggleDropdown={toggleDropdown}
        dropdownRef={dropdownRef}
        theme={theme}
        toggleTheme={toggleTheme}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

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
