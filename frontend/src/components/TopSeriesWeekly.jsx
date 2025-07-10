import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/TopSeriesGrid.css';
import { useFavoriteToggle } from '../hooks/useFavoriteToggle';

const TopSeriesWeekly = () => {
  const [series, setSeries] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const { isFavorite, toggleFavorite, loading } = useFavoriteToggle();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/series/top-weekly`)
      .then(res => setSeries(res.data.top.slice(0, 20))) // máx 20
      .catch(err => console.error('Error cargando top semanal:', err));
  }, []);

  const getLogoPath = (platform) => {
    const key = platform.toLowerCase().replace(/\s/g, '-').replace('+', 'plus');
    return `/assets/platforms/${key}.svg`;
  };

  const visibleSeries = expanded ? series : series.slice(0, 5);

  return (
    <div className="top-series-grid-container">
      <h2 className="top-series-title">🔥 Top semanal de series</h2>
      <div className="top-series-grid">
        {visibleSeries.map((serie, idx) => (
          <Link to={`/series/${serie.tmdbId}`} className="top-series-card" key={idx}>
            <div className="top-series-rank">#{idx + 1}</div>
            <img src={serie.image} alt={serie.title} className="top-series-poster" />
            <div
              className="card-fav-toggle"
              onClick={(e) => {
                e.preventDefault();
                if (!loading) toggleFavorite(serie._id);
              }}
              title={loading ? 'Cargando...' : isFavorite(serie._id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              <span className={`heart-icon ${isFavorite(serie._id) ? 'active' : ''}`}>
                {isFavorite(serie._id) ? '❤️' : '🤍'}
              </span>
            </div>
            <div className="top-series-title-text">{serie.title}</div>
            <div className="top-series-platforms">
              {(serie.availability || []).map((p, i) => (
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

      {series.length > 5 && (
        <div className="top-series-toggle-btn-container">
          <button onClick={() => setExpanded(!expanded)} className="top-series-toggle-btn">
            {expanded ? 'Mostrar menos ▲' : 'Ver más ▼'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TopSeriesWeekly;
