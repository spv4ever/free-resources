import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/TopSeriesWeekly.css';

const TopSeriesWeekly = () => {
  const [allSeries, setAllSeries] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/series/top-weekly`)
      .then(res => setAllSeries(res.data.top.slice(0, 20))) // Guardamos hasta 20
      .catch(err => console.error('Error cargando top semanal:', err));
  }, []);
  
  const getLogoPath = (platform) => {
    const key = platform.toLowerCase().replace(/\s/g, '-').replace('+', 'plus');
    return `/assets/platforms/${key}.svg`;
  };

  const visibleSeries = showAll ? allSeries : allSeries.slice(0, 10);

  return (
    <div className="top-series-card">
      <h2>🔥 Top semanal de series</h2>
      <div className="top-series-list" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {visibleSeries.map((serie, index) => (
          <Link to={`/series/${serie.tmdbId}`} className="top-series-item" key={serie.tmdbId}>
            <span className="top-rank">#{index + 1}</span>
            <img src={serie.image} alt={serie.title} className="top-poster" />
            <h4 className="top-title">{serie.title}</h4>
            <div className="top-platforms">
              {(serie.availability || []).map((p, i) => (
                <img
                  key={i}
                  src={getLogoPath(p.platform)}
                  alt={p.platform}
                  title={p.platform}
                  className="top-logo"
                />
              ))}
            </div>
          </Link>
        ))}
      </div>
      {allSeries.length > 10 && (
        <div className="ver-mas-container">
          <button className="ver-mas-btn" onClick={() => setShowAll(!showAll)}>
            {showAll ? '⬆ Ver menos' : '⬇ Ver más series'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TopSeriesWeekly;
