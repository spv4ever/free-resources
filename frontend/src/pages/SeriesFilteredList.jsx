
// src/pages/SeriesFilteredList.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import '../styles/SeriesCategoryList.css';
import { Link } from 'react-router-dom';

const statusLabels = {
  favorites: '⭐ Favoritas',
  completed: '✅ Completadas',
  watching: '👀 Viendo',
  'to-start': '🆕 Por empezar'
};

function SeriesFilteredList() {
  const { status } = useParams();
  const { user } = useUser();
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (!user?._id || !status) return;
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/user-series?userId=${user._id}&status=${status}`)
      .then(res => setSeries(res.data))
      .catch(err => console.error('Error al cargar series filtradas:', err));
  }, [user, status]);

  return (
    <div className="series-category-page">
      <h1>{statusLabels[status] || 'Series filtradas'}</h1>
      <div className="series-category-grid">
        {series.length > 0 ? (
            series.map(item => (
                <Link
                key={item._id}
                to={`/series/${item.seriesId.tmdbId}`}
                className="series-category-card"
                >
                <img src={item.seriesId.image} alt={item.seriesId.title} />
                <h2>{item.seriesId.title}</h2>
                </Link>
            ))
            ) : (
            <p>No hay series en esta categoría.</p>
            )}
      </div>
    </div>
  );
}

export default SeriesFilteredList;
