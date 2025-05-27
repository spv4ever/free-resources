import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/TopSeriesWeekly.css';

const TopSeriesWeekly = () => {
  const [series, setSeries] = useState([]);
  const carouselRef = useRef(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/series/top-weekly`)
      .then(res => setSeries(res.data.top))
      .catch(err => console.error('Error cargando top semanal:', err));
  }, []);

  const scroll = (dir) => {
    const container = carouselRef.current;
    const scrollAmount = 240; // Ajusta si es necesario
    container.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
  };

  const getLogoPath = (platform) => {
    const key = platform.toLowerCase().replace(/\s/g, '-').replace('+', 'plus');
    return `/assets/platforms/${key}.svg`;
  };

  return (
    <div className="top-weekly-card">
      <h2>🔥 Top semanal de series</h2>
      <div className="top-weekly-carousel-wrapper">
        <button className="nav-arrow left" onClick={() => scroll(-1)}>◀</button>
        <div className="top-weekly-carousel" ref={carouselRef}>
          {series.map((serie, idx) => (
            <Link to={`/series/${serie.tmdbId}`} className="top-weekly-item" key={idx}>
              <img src={serie.image} alt={serie.title} className="top-weekly-poster" />
              <div className="top-weekly-title">{serie.title}</div>
              <div className="top-weekly-platforms">
                {(serie.availability || []).map((p, i) => (
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

export default TopSeriesWeekly;
