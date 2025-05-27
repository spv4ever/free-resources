import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SeriesCategoryList.css';
import TopSeriesWeekly from '../components/TopSeriesWeekly';

const SeriesCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/series/categories`)
      .then(res => setCategories(res.data))
      .catch(err => console.error('Error al cargar categorías:', err));
  }, []);

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.length < 3) return setResults([]);
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/series/search?q=${q}`);
      setResults(res.data);
    } catch (err) {
      console.error('Error al buscar series', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (tmdbId) => {
    setIsProcessing(true);
    try {
      await axios.get(`${process.env.REACT_APP_API_URL}/api/series/${tmdbId}`);
      navigate(`/series/${tmdbId}`);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        try {
          await axios.post(`${process.env.REACT_APP_API_URL}/api/series/import/${tmdbId}`);
          navigate(`/series/${tmdbId}`);
        } catch (importErr) {
          console.error('❌ Error al importar serie', importErr);
          alert('❌ No se pudo importar la serie.');
        }
      } else {
        console.error('❌ Error al verificar serie', err);
        alert('❌ Error al verificar si la serie existe.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="series-category-list">
      
      <h1>Categorías de Series</h1>
      <TopSeriesWeekly />

      <div className="series-category-grid">
        {categories.map(cat => (
          <Link to={`/series/categoria/${cat.slug}`} key={cat._id} className="series-category-card">
            <h2>{cat.nombre}</h2>
            <p>{cat.count} series</p>
          </Link>
        ))}
      </div>

      <div className="series-search-box">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="🔍 Buscar series en TMDb..."
        />
        {loading && <p>Buscando...</p>}
        {isProcessing && <p className="series-loading-message">Cargando serie...</p>}
        {results.length > 0 && (
          <ul className="series-search-results">
            {results.slice(0, 5).map((serie) => (
              <li key={serie.tmdbId} onClick={() => handleSelect(serie.tmdbId)}>
                {serie.image ? (
                  <img src={serie.image} alt={serie.title || 'Sin título'} />
                ) : (
                  <div className="series-img-placeholder">Sin imagen</div>
                )}
                <div>
                  <strong>{serie.title || 'Sin título'}</strong>{' '}
                  {serie.year ? `(${serie.year})` : ''}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SeriesCategoryList;
