import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ViralShorts.css';

const ViralShorts = () => {
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/short-categories`)
      .then(res => res.json())
      .then(data => setCategorias(data.filter(cat => cat.activa)));
  }, []);

  return (
    <div className="viral-list-container">
      <h1 className="viral-list-title">Categorías de Videos Virales</h1>
      <div className="viral-list-cards">
        {categorias.map(cat => (
          <div
            key={cat._id}
            className="viral-list-card"
            onClick={() => navigate(`/viral-shorts/${cat._id}`)}
          >
            {cat.imageUrl && (
              <img src={cat.imageUrl} alt={cat.nombre} className="viral-list-image" />
            )}
            <h3>{cat.nombre}</h3>
            <p>{cat.descripcion}</p>
            <span className="viral-list-tag">{cat.subcategoria}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViralShorts;