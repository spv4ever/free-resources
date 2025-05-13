import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

const NasaCardVideo = () => {
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/nasa-images/latestvideo`)
      .then(res => setImage(res.data))
      .catch(err => console.error('Error cargando imagen de NASA:', err));
  }, []);

  if (!image) return null;

  return (
    <div className="card-home" onClick={() => navigate('/media/videos-universo')} style={{ cursor: 'pointer' }}>
      <h2>📸 Último Video del Universo</h2>
      <iframe
        src={image.url}
        title={image.titulo}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        style={{
          width: '100%',
          height: '360px', // o ajusta según tu diseño: 480px, 500px, etc.
          borderRadius: '10px',
          marginBottom: '1rem'
        }}
      ></iframe>
      <h3>{image.titulo}</h3>
      <p>{image.fecha}</p>
    </div>
  );
};

export default NasaCardVideo;
