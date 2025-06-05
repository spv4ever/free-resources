import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/TopSeriesWeekly.css'; // Reutilizamos los estilos

const LastFavoritesCarousel = () => {
  const [favorites, setFavorites] = useState([]);
  const carouselRef = useRef(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/series/favorites/latest`)
      .then(res => setFavorites(res.data))
      .catch(err => console.error('Error cargando favoritos:', err));
  }, []);

  const scroll = (dir) => {
    const container = carouselRef.current;
    const scrollAmount = 240;
    container.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
  };

  const getLogoPath = (platform) => {
    const key = platform.toLowerCase().replace(/\s/g, '-').replace('+', 'plus');
    return `/assets/platforms/${key}.svg`;
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="top-weekly-card">
      <h2>❤️ Últimos favoritos de la comunidad</h2>
      <div className="top-weekly-carousel-wrapper">
        <button className="nav-arrow left" onClick={() => scroll(-1)}>◀</button>
        <div className="top-weekly-carousel" ref={carouselRef}>
          {favorites.map((fav, idx) => (
            <Link
                to={`/series/${fav.tmdbId}`}
                className={`top-weekly-item ${fav.totalFavorites > 5 ? 'popular-favorite' : ''}`}
                key={idx}
                >
              <img src={fav.image} alt={fav.title} className="top-weekly-poster" />
              <div className="top-weekly-title">{fav.title}</div>

              <div className="top-weekly-user-info">
                Añadido por <strong>{fav.addedBy}</strong><br />
                <small>{formatDate(fav.addedAt)}</small><br />
                <span
                    className="followers-count"
                    title={`Añadida por ${fav.addedBy} – Última vez añadida: ${formatDate(fav.addedAt)}\nTambién siguen esta serie: ${fav.followerNicknames.join(', ')}`}
                    >
                    👥 Seguido por {fav.totalFavorites} {fav.totalFavorites === 1 ? 'persona' : 'personas'}
                    </span>
              </div>

              <div className="top-weekly-platforms">
                {(fav.availability || []).map((p, i) => (
                  <img
                    key={i}
                    src={getLogoPath(p.platform)}
                    alt={p.platform}
                    title={p.platform}
                    className="top-weekly-logo"
                  />
                ))}
              </div>
            </Link>
          ))}
        </div>
        <button className="nav-arrow right" onClick={() => scroll(1)}>▶</button>
      </div>
    </div>
  );
};

export default LastFavoritesCarousel;
