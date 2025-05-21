import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/TopSeriesWeekly.css';

const TopSeriesWeekly = () => {
  const [topSeries, setTopSeries] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/series/top-weekly`)
      .then(res => setTopSeries(res.data.top.slice(0, 10)))
      .catch(err => console.error('Error cargando top semanal:', err));
  }, []);
  
  const getLogoPath = (platform) => {
    const key = platform.toLowerCase().replace(/\s/g, '-').replace('+', 'plus');
    return `/assets/platforms/${key}.svg`;
  };

  return (
    <div className="top-series-card">
      <h2>🔥 Top semanal de series</h2>
      <div className="top-series-list" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {topSeries.map((serie, index) => (
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
    </div>
  );
};

export default TopSeriesWeekly;
