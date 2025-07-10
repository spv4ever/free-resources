import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/TopSeriesGrid.css'; // reutilizamos el mismo estilo que TopSeriesWeekly
import { useFavoriteToggle } from '../hooks/useFavoriteToggle';

const LastFavoritesCarousel = () => {
  const [favorites, setFavorites] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const { isFavorite, toggleFavorite, loading } = useFavoriteToggle();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/series/favorites/latest`)
      .then(res => setFavorites(res.data.slice(0, 20))) // limitar a 20
      .catch(err => console.error('Error cargando favoritos:', err));
  }, []);

  const getLogoPath = (platform) => {
    const key = platform.toLowerCase().replace(/\s/g, '-').replace('+', 'plus');
    return `/assets/platforms/${key}.svg`;
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const visibleItems = expanded ? favorites : favorites.slice(0, 5);

  return (
    <div className="top-series-grid-container">
      <h2 className="top-series-title">❤️ Últimos favoritos de la comunidad</h2>
      <div className="top-series-grid">
        {visibleItems.map((fav, idx) => (
          <Link
            to={`/series/${fav.tmdbId}`}
            className={`top-series-card ${fav.totalFavorites > 5 ? 'popular-favorite' : ''}`}
            key={idx}
          >
            <img src={fav.image} alt={fav.title} className="top-series-poster" />
            <div
              className="card-fav-toggle"
              onClick={(e) => {
                e.preventDefault();
                if (!loading) toggleFavorite(fav._id);
              }}
              title={loading ? 'Cargando...' : isFavorite(fav._id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              <span className={`heart-icon ${isFavorite(fav._id) ? 'active' : ''}`}>
                {isFavorite(fav._id) ? '❤️' : '🤍'}
              </span>
            </div>

            <div className="top-series-title-text">{fav.title}</div>

            <div className="top-series-user-info">
              Añadido por <strong>{fav.addedBy}</strong><br />
              <small>{formatDate(fav.addedAt)}</small><br />
              <span
                className="followers-count"
                title={`Añadida por ${fav.addedBy} – Última vez añadida: ${formatDate(fav.addedAt)}\nTambién siguen esta serie: ${fav.followerNicknames.join(', ')}`}
              >
                👥 Seguido por {fav.totalFavorites} {fav.totalFavorites === 1 ? 'persona' : 'personas'}
              </span>
            </div>

            <div className="top-series-platforms">
              {(fav.availability || []).map((p, i) => (
                <img
                  key={i}
                  src={getLogoPath(p.platform)}
                  alt={p.platform}
                  title={p.platform}
                  className="top-series-logo"
                />
              ))}
            </div>
          </Link>
        ))}
      </div>

      {favorites.length > 5 && (
        <div className="top-series-toggle-btn-container">
          <button onClick={() => setExpanded(!expanded)} className="top-series-toggle-btn">
            {expanded ? 'Mostrar menos ▲' : 'Ver más ▼'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LastFavoritesCarousel;
