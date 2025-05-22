import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom'; // ✅ Asegúrate de importar esto
import axios from 'axios';
import '../styles/CategorySeriesPage.css'; // crea luego este archivo

const CategorySeriesPage = () => {
  const { slug } = useParams();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/series/categories/${slug}`)
      .then(res => setSeries(res.data))
      .catch(err => console.error('Error al cargar series:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="category-series-page">
      <h1>Series en "{slug.replace(/-/g, ' ')}"</h1>
      <div className="series-grid">
        {series.map(serie => (
          <Link to={`/series/${serie.tmdbId}`} key={serie._id} className="serie-card">
            <img src={serie.image || '/placeholder.jpg'} alt={serie.title} />
            <h2>{serie.title}</h2>
            <p>{serie.voteAverage ? `⭐ ${serie.voteAverage.toFixed(1)}` : 'Sin puntuación'}</p>
            </Link>
        ))}
      </div>
    </div>
  );
};

export default CategorySeriesPage;
