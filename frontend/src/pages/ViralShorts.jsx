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
    <div className="ai-admin-container">
      <h1 className="ai-admin-title">Categorías de Videos Virales</h1>
      <div className="ai-admin-cards">
        {categorias.map(cat => (
          <div
            key={cat._id}
            className="ai-admin-card"
            onClick={() => navigate(`/viral-shorts/${cat._id}`)}
          >
            <h3>{cat.nombre}</h3>
            <p>{cat.descripcion}</p>
            <span className="ai-admin-tag">{cat.subcategoria}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViralShorts;
