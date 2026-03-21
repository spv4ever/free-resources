import React, { useEffect, useState } from 'react';
// import MetaTags from '../components/MetaTags';
import '../styles/HomePage.css';
import { Link, useLocation } from 'react-router-dom';
import { FaCircleInfo } from 'react-icons/fa6';
import axios from 'axios';
import AffiliatePopup from '../components/AffiliatePopup';

function HomePage() {
  const location = useLocation();
  const [topSeries, setTopSeries] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/series/top-weekly`)
      .then(res => setTopSeries(res.data.top.slice(0, 10)))
      .catch(() => setTopSeries([]));
  }, []);

  return (
    <div className="homepage-content">
      {/* <MetaTags 
        title="Keikodev - Desarrollo Web, IA y Tecnología" 
        description="Explora proyectos, tutoriales y artículos sobre desarrollo web, inteligencia artificial y las últimas tendencias en tecnología."
      /> */}
      <div className="cards-container">
        <Link to="/keikoprompts" className="card-home card-home-link card-keikoprompts">
          <h2>🎯 Explora KeikoPrompts</h2>
          <p>Inspiración creativa y generación de imágenes IA desde un solo lugar.</p>
          <ul>
            <li>🧩 Navega y copia prompts optimizados</li>
            <li>🎨 Genera imágenes con tokens directamente en la web</li>
            <li>🚀 Compatible con MidJourney, ChatGPT, PixAI y más</li>
          </ul>

          <p className="keiko-footer">
            ¡Empieza gratis con tokens diarios!
          </p>
        </Link>

        <Link to="/series" className="card-home card-home-link">
          <h2>📺 Top 10 Series de la semana</h2>
          <div className="top-series-list">
            {topSeries.slice(0, 10).map((serie, idx) => (
              <div className="top-series-item" key={serie._id}>
                <img src={serie.image} alt={serie.title} />
                <span>{idx + 1}. {serie.title}</span>
              </div>
            ))}
          </div>
        </Link>

        <AffiliatePopup currentPath={location.pathname} />
      </div>

      <p style={{ color: '#ccc', fontSize: '0.85rem', marginTop: '0.5rem' }}>
        🎯 Para participar, únete primero a nuestro canal en Telegram.
      </p>
      <a
        href="https://t.me/keikodevrecursos"
        target="_blank"
        rel="noopener noreferrer"
        className="telegram-fab"
        title="Únete al canal para acceder al soporte"
      >
        <FaCircleInfo size={24} color="white" />
      </a>
    </div>
  );
}

export default HomePage;
