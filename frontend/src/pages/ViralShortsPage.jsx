import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ViralShortsPage.css';
import AdBanner from '../components/AdBanner';

function ViralShortsPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchShorts = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/viral-shorts/subcategoria/Humor`);
        setData(res.data);
      } catch (error) {
        console.error('Error al cargar shorts virales:', error);
      }
    };

    fetchShorts();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num;
  };
  
  const formatDate = (isoDate) => {
    const [y, m, d] = isoDate.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
  };
  
  return (
    <div className="viral-shorts-page">
      <AdBanner />
      {/* <h2>Shorts Virales</h2> */}
      {Array.isArray(data) && data.map((group) => (
        <div key={group.categoriaId} className="short-category">
          <h2>{group.categoriaNombre}</h2>
          <div className="shorts-grid">
            {group.shorts.map((short) => (
              <div key={short._id} className="short-card">
                <iframe
                src={`https://www.youtube.com/embed/${short.videoId}`}
                title={short.title}
                onError={(e) => {
                    e.target.style.display = 'none';
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                />
                <p className="short-title">{short.title}</p>
                <p className="short-title"><strong>Canal:</strong> {short.channelTitle}</p>
                <div className="short-meta">
                    <span><strong>👁</strong> {formatNumber(short.views)}</span>
                    <span><strong>👍</strong> {formatNumber(short.likes)}</span>
                    <span><strong>🕒</strong> {formatDate(short.publishedAt)}</span>
                </div>
              </div>
            ))}
          </div>
          <AdBanner />
        </div>
      ))}
    </div>
  );
}

export default ViralShortsPage;
