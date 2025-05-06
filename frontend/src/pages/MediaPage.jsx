import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/MediaPage.css';
import AdBanner from '../components/AdBanner';

function MediaPage() {
  const libraries = [
    {
      title: 'Fotos del universo',
      description: 'Explora imágenes astronómicas obtenidas de la NASA.',
      path: '/media/fotos-universo',
      background: '#1e1e2f',
      icon: '📷'
    },
    {
      title: 'Videos del universo',
      description: 'Descubre videos educativos y espectaculares del espacio.',
      path: '/media/videos-universo',
      background: '#1e2f2f',
      icon: '🎥'
    }
  ];

  return (
    <div className="media-page">
      <AdBanner />
      <h2 className="media-title">Biblioteca de medios</h2>
      <div className="media-grid">
        {libraries.map((item, index) => (
          <Link key={index} to={item.path} className="media-card" style={{ background: item.background }}>
            <div className="media-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MediaPage;
