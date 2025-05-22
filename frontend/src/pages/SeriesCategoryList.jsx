import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/SeriesCategoryList.css'; // crea luego este archivo

const SeriesCategoryList = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/series/categories`)
      .then(res => setCategories(res.data))
      .catch(err => console.error('Error al cargar categorías:', err));
  }, []);

  return (
    <div className="category-list">
      <h1>Categorías de Series</h1>
      <div className="category-grid">
        {categories.map(cat => (
          <Link to={`/series/categoria/${cat.slug}`} key={cat._id} className="category-card">
            <div className="category-img" style={{ backgroundImage: `url(${cat.imagen || '/placeholder.jpg'})` }} />
            <div className="category-info">
              <h2>{cat.nombre}</h2>
              <p>{cat.count} series</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SeriesCategoryList;
