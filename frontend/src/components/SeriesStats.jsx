// src/components/SeriesStats.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import '../styles/SeriesStats.css';

function SeriesStats() {
  const [stats, setStats] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?._id) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/series-user-stats/${user._id}`)
        .then(res => setStats(res.data))
        .catch(err => console.error('Error al cargar estadísticas:', err));
    }
  }, [user]);

  const handleClick = (status) => {
    navigate(`/series/estado/${status}`);
  };

  if (!stats) return <p>Cargando estadísticas...</p>;

  return (
    <div className="series-stats-container">
      <div className="series-stats-card" onClick={() => handleClick('favorites')}>
        <span className="emoji">⭐</span>
        <p>Favoritas</p>
        <h2>{stats.favorites}</h2>
      </div>
      <div className="series-stats-card" onClick={() => handleClick('completed')}>
        <span className="emoji">✅</span>
        <p>Completadas</p>
        <h2>{stats.completed}</h2>
      </div>
      <div className="series-stats-card" onClick={() => handleClick('watching')}>
        <span className="emoji">👀</span>
        <p>Viendo</p>
        <h2>{stats.watching}</h2>
      </div>
      <div className="series-stats-card" onClick={() => handleClick('to-start')}>
        <span className="emoji">🆕</span>
        <p>Por empezar</p>
        <h2>{stats.toStart}</h2>
      </div>
    </div>
  );
}

export default SeriesStats;
