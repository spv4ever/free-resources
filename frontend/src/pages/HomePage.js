import React, { useEffect, useState } from 'react';
import '../styles/HomePage.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import NasaCard from '../components/NasaCard';
import NasaCardVideo from '../components/NasaCardVideo';
import AdBanner from '../components/AdBanner';
import AdBannerExtra from '../components/AdBannerExtra';
import AffiliatePopup from '../components/AffiliatePopup';
import IgraalDealHighlight from '../components/IgraalDealHighlight';
import IgraalDiscountHighlight from '../components/IgraalDiscountHighlight';
import { useCountdown } from '../hooks/useCountdown';
import { useUser } from '../context/UserContext';

dayjs.extend(utc);
dayjs.extend(timezone);

function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [launches, setLaunches] = useState([]);
  const [aiStats, setAiStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [topSeries, setTopSeries] = useState([]);

  const CountdownBox = ({ launchDateUtc }) => {
    const countdown = useCountdown(launchDateUtc);

    return (
      <div className="countdown-box">
        ⏳ Próximo lanzamiento en: <span>{countdown}</span>
      </div>
    );
  };

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/resources/stats/per-category`)
      .then(res => setCategoryStats(res.data))
      .catch(() => setCategoryStats([]));
  }, []);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/scam-posts/latest`)
      .then(res => setPosts(res.data))
      .catch(() => setPosts([]));

    axios.get(`${process.env.REACT_APP_API_URL}/api/spacex/next-launches`)
      .then(res => setLaunches(res.data))
      .catch(() => setLaunches([]));

    axios.get(`${process.env.REACT_APP_API_URL}/api/aitools/stats/per-category`)
      .then(res => setAiStats(res.data))
      .catch(() => setAiStats([]));

    axios.get(`${process.env.REACT_APP_API_URL}/api/series/top-weekly`)
    .then(res => setTopSeries(res.data.top.slice(0, 10))) // Solo los 10 primeros
    .catch(() => setTopSeries([]));
    }, []);

    const nextLaunch = launches.length > 0 ? { dateUtc: launches[0].net } : null;

  return (
    <div className="homepage-content">
      <div className="cards-container">

        {/* TOP 10 SERIES */}
        <div className="card-home" onClick={() => navigate('/series')}>
          <h2>📺 Top 10 Series de la Semana</h2>
          <div className="top-series-list">
            {topSeries.slice(0, 10).map((serie, idx) => (
              <div className="top-series-item" key={serie._id}>
                <img src={serie.image} alt={serie.title} />
                <span>{idx + 1}. {serie.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* LANZAMIENTOS */}
        <div className="card-home" onClick={() => navigate('/spacex')}>
          <h2>🚀 Próximos Lanzamientos</h2>
          <ul>
            {launches.slice(0, 7).map((launch) => {
              const fechaFormateada = dayjs.utc(launch.net).tz('Europe/Madrid').format('DD/MM/YYYY HH:mm');
              return (
                <li key={launch.id}>
                  {launch.name} – {fechaFormateada}
                </li>
              );
            })}
          </ul>
          {nextLaunch && <CountdownBox launchDateUtc={nextLaunch.dateUtc} />}
        </div>

        {/* NOTICIAS DE ESTAFA */}
        <div className="card-home" onClick={() => navigate('/scam-posts')}>
          <h2>🛑 Últimas Noticias de Estafas</h2>
          <ul>
            {posts.slice(0, 6).map((post) => (
              <li key={post._id}>
                <strong>{new Date(post.createdAt).toLocaleDateString('es-ES')}</strong>:&nbsp;
                <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                  {post.resumen.slice(0, 20)}...
                  <a
                    href={`/scam-posts/${post._id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: '#3498db', whiteSpace: 'nowrap' }}
                  >
                    Ver más →
                  </a>
                </span>
              </li>
            ))}
          </ul>

          {/* Teletipo visual que hereda el click de la tarjeta */}
          <div className="teletipo-banner">
            <div className="teletipo-inner">
              🔐 Protege tus datos con nuestro Analizador IA de enlaces sospechosos 🔍
            </div>
          </div>
        </div>


        {/* HERRAMIENTAS DE IA */}
        <div className="card-home" onClick={() => navigate('/ai-links')}>
          <h2>🧠 Herramientas de IA por Categoría</h2>
          <ul>
            {aiStats.map(stat => (
              <li key={stat.tipo}>
                {stat.tipo ? stat.tipo.charAt(0).toUpperCase() + stat.tipo.slice(1) : 'Tipo desconocido'}: {stat.count} herramientas
              </li>
            ))}
          </ul>
        </div>

        {/* COMPONENTES VISUALES */}
        <NasaCard />
        <NasaCardVideo />
        <IgraalDealHighlight />
        <IgraalDiscountHighlight />

        {/* TARJETA MOVIDA AL FINAL */}
        <div className="card-home" onClick={() => navigate('/resources')}>
          <h2>📚 Recursos por Categoría</h2>
          <ul>
            {categoryStats.map(stat => (
              <li key={stat.category}>
                {stat.category}: {stat.count} recursos
              </li>
            ))}
          </ul>
        </div>
        {/* CANAL DE TELEGRAM */}
        <div className="card-home telegram-card" onClick={(e) => {
            if (e.target.tagName !== 'IMG') {
              window.open('https://t.me/+DO4DQPYGyJRiN2Nk', '_blank');
            }
          }}>
            <div className="telegram-content">
              <div className="telegram-text">
                <h2>📢 <span style={{ color: '#00bfff' }}>Únete a nuestro canal de Telegram</span></h2>
                <p>Recibe actualizaciones, herramientas y novedades directamente en tu móvil. ¡Comienza como Beta Tester gratis!</p>
                <p style={{ fontWeight: 'bold', marginTop: '10px' }}>👉 ¡Haz clic aquí para unirte!</p>
              </div>
              <div className="telegram-image">
                <img src="/assets/qr_telegram.jpg" alt="QR Telegram" className="qr-image" />
              </div>
            </div>
          </div>

        <AffiliatePopup currentPath={location.pathname} />
      </div>

      {!user || (user.role !== 'pro' && user.role !== 'admin') ? (
          <>
            <AdBanner />
            <AdBannerExtra />
          </>
        ) : null}
    </div>
  );
}

export default HomePage;
