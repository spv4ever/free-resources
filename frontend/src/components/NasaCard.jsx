import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

const NasaCard = () => {
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/nasa-images/latest`)
      .then(res => setImage(res.data))
      .catch(err => console.error('Error cargando imagen de NASA:', err));
  }, []);

  if (!image) return null;

  return (
    <div className="card-home" onClick={() => navigate('/media/fotos-universo')} style={{ cursor: 'pointer' }}>
      <h2>📸 Última Imagen del Universo</h2>
      <img
        src={image.url}
        alt={image.titulo}
        style={{ maxWidth: '100%', borderRadius: '10px', marginBottom: '1rem' }}
      />
      <h3>{image.titulo}</h3>
      <p>{image.fecha}</p>
    </div>
  );
};

export default NasaCard;
