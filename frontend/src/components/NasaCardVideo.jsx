import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/nasacardvideo.css'; // ✅ nuevo CSS específico

const NasaCardVideo = () => {
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/nasa-images/latestvideo`)
      .then(res => setImage(res.data))
      .catch(err => console.error('Error cargando video de NASA:', err));
  }, []);

  if (!image) return null;

  return (
    <div
      className="nasa-video-card"
      onClick={() => navigate('/media/videos-universo')}
    >
      <h2>📸 Último Video del Universo</h2>
      <iframe
        src={image.url}
        title={image.titulo}
        className="nasa-video-iframe"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      ></iframe>
      <div className="nasa-video-info">
        <h3>{image.titulo}</h3>
        <p>{image.fecha}</p>
      </div>
    </div>
  );
};

export default NasaCardVideo;
