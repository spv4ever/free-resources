import React, { useEffect, useRef, useState } from 'react';
import '../styles/HomePage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

function HomePage() {
  const adRef1 = useRef(null);
  const adRef2 = useRef(null);
  const [posts, setPosts] = useState([]);
  const [launches, setLaunches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.atOptions = {
      key: '7b41f8ab4abf2107bbab81fb2739b873',
      format: 'iframe',
      height: 90,
      width: 728,
      params: {}
    };
    const script1 = document.createElement('script');
    script1.src = '//sunkendifferextreme.com/7b41f8ab4abf2107bbab81fb2739b873/invoke.js';
    script1.type = 'text/javascript';
    script1.async = true;
    if (adRef1.current) {
      adRef1.current.innerHTML = '';
      adRef1.current.appendChild(script1);
    }

    const script2 = document.createElement('script');
    script2.src = '//pl26532855.profitableratecpm.com/3119807f99626201d0d4d511e11bba8b/invoke.js';
    script2.type = 'text/javascript';
    script2.async = true;
    if (adRef2.current) {
      adRef2.current.innerHTML = '<div id="container-3119807f99626201d0d4d511e11bba8b"></div>';
      adRef2.current.appendChild(script2);
    }
  }, []);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/scam-posts/latest`)
      .then(res => setPosts(res.data))
      .catch(() => setPosts([]));

    axios.get(`${process.env.REACT_APP_API_URL}/api/spacex/next-launches`)
      .then(res => setLaunches(res.data))
      .catch(() => setLaunches([]));
  }, []);

  return (
    <div className="homepage-content">
      <h1 className="homepage-title">Bienvenido a KeikoDev Recursos Gratis</h1>

      <div className="cards-container">
        <div className="card-home" onClick={() => navigate('/spacex')}>
          <h2>🚀 Próximos Lanzamientos</h2>
          <ul>
            {launches.slice(0, 3).map((launch) => {
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
            {posts.slice(0, 3).map((post) => (
              <li key={post._id}>{post.resumen.slice(0, 80)}...</li>
            ))}
          </ul>
        </div>
      </div>

      <div ref={adRef1} style={{ textAlign: 'center', margin: '2rem auto' }} />
      <div ref={adRef2} style={{ textAlign: 'center', margin: '2rem auto' }} />
    </div>
  );
}

export default HomePage;
