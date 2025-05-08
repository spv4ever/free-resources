import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaBook, FaRobot, FaYoutube, FaFileAlt, FaImage, FaGraduationCap, FaRocket, FaShieldVirus } from 'react-icons/fa';
import '../styles/HomePage.css';
//import '../styles/Layout.css'; // nuevo archivo opcional para estilos de layout

const sections = [
  { title: 'Recursos', description: 'Accede a nuestra biblioteca de imágenes y recursos.', path: '/resources', icon: <FaBook /> },
  { title: 'AI Links', description: 'Lista de herramientas de inteligencia artificial.', path: '/ai-links', icon: <FaRobot /> },
  { title: 'YouTube Channels', description: 'Nuestros canales recomendados de YouTube.', path: '/youtube-channels', icon: <FaYoutube /> },
  { title: 'Humor', description: 'Videos de humor y memes', path: '/viral-shorts', icon: <FaFileAlt /> },
  { title: 'Formación', description: 'Recursos gratuitos para aprender.', path: '/training', icon: <FaGraduationCap /> },
  { title: 'MultiMedia', description: 'Imágenes del universo, los mejores vídeos, todo Multimedia', path: '/media', icon: <FaImage /> },
  {
    title: 'SpaceX',
    description: 'Todo lo relacionado con los lanzamientos de SpaceX. Rumbo a Marte',
    path: '/spacex',
    icon: <FaRocket />
  },
  {
    title: 'CiberEstafas',
    description: 'Todo lo relacionado Noticias sobre ciberestafas.',
    path: '/scam-posts',
    icon: <FaShieldVirus />
  },
  
];

function Layout() {
  return (
    <div className="layout-container">
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
      </main>

      <Footer />
    </div>
  );
}

export default Layout;
