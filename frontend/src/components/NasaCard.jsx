import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/NasaCard.css'; // ✅ ahora cargamos el CSS específico

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
    <div
      className="nasa-card"
      onClick={() => navigate('/media/fotos-universo')}
    >
      <h2>📸 Última Imagen del Universo</h2>
      <img
        src={image.url}
        alt={image.titulo}
        className="nasa-card-image"
      />
      <div className="nasa-card-info">
        <h3>{image.titulo}</h3>
        <p>{image.fecha}</p>
      </div>
    </div>
  );
};

export default NasaCard;
