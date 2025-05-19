import React, { useEffect, useState } from 'react';
import '../styles/HomePage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import NasaCard from '../components/NasaCard';
import NasaCardVideo from '../components/NasaCardVideo';
import AdBanner from '../components/AdBanner';
import { useLocation } from 'react-router-dom';
import AffiliatePopup from '../components/AffiliatePopup';
import IgraalDealHighlight from '../components/IgraalDealHighlight';
import TopSeriesWeekly from '../components/TopSeriesWeekly';



dayjs.extend(utc);
dayjs.extend(timezone);

function HomePage() {
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [launches, setLaunches] = useState([]);
  const navigate = useNavigate();
  const [aiStats, setAiStats] = useState([]);

  const [categoryStats, setCategoryStats] = useState([]);
  
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
  }, []);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/aitools/stats/per-category`)
      .then(res => {
        console.log("🔍 aiStats response:", res.data);
        setAiStats(res.data);
      })
      .catch(() => setAiStats([]));
  }, []);

  return (
    <div className="homepage-content">
      <h1 className="homepage-title">Bienvenido a KeikoDev Recursos Gratis</h1>
      <TopSeriesWeekly />
      <div className="cards-container">
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
        </div>

        <div className="card-home" onClick={() => navigate('/scam-posts')}>
          <h2>🛑 Últimas Noticias de Estafas</h2>
          <ul>
            {posts.slice(0, 6).map((post) => (
              <li key={post._id}>
                <strong>{new Date(post.createdAt).toLocaleDateString('es-ES')}</strong>:&nbsp;
                <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                  {post.resumen.slice(0, 30)}...
                  <a
                    href={`/scam-posts/${post._id}`}
                    onClick={(e) => e.stopPropagation()} // 👈 evita que se dispare el onClick del padre
                    style={{ color: '#3498db', whiteSpace: 'nowrap' }}
                  >
                    Ver más →
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </div>
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
        <div className="card-home" onClick={() => navigate('/ai-links')}>
          <h2>🧠 Herramientas de IA por Categoría</h2>
          <ul>
          {aiStats.map(stat => (
            <li key={stat.tipo}>
              {stat.tipo
                ? stat.tipo.charAt(0).toUpperCase() + stat.tipo.slice(1)
                : 'Tipo desconocido'}: {stat.count} herramientas
            </li>
          ))}
          </ul>
        </div>
        <AffiliatePopup currentPath={location.pathname} />
        
        <NasaCard />
        <NasaCardVideo />
        <IgraalDealHighlight />
        
      </div>
      
      
      
<AdBanner />
      </div>
  );
}

export default HomePage;
