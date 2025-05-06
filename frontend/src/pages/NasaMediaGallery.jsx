import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/NasaGallery.css';
import AdBanner from '../components/AdBanner';

function NasaMediaGallery({ mediaType }) {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [zoomItem, setZoomItem] = useState(null);
  const topRef = useRef(null);


  const formatDate = (fechaIso) => {
    const [a, m, d] = fechaIso.split('-');
    return `${d}/${m}/${a}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/nasa-images`);
        const filtrados = res.data.filter(item => item.media_type === mediaType);
        const ordenados = filtrados.sort((a, b) => b.fecha.localeCompare(a.fecha));
        setItems(ordenados);
        setCurrentPage(1);
      } catch (error) {
        console.error('Error al cargar datos de la NASA:', error);
      }
    };
    fetchData();
  }, [mediaType]);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setZoomItem(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
    );
  return (
    
    <div className="nasa-gallery" ref={topRef}>
      <AdBanner />
      <h2 className="gallery-title">
        {mediaType === 'image' ? 'Fotos del universo' : 'Videos del universo'}
      </h2>
      {totalPages > 1 && (
        <div className="gallery-pagination">
            <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            >
            ⏮ Primera
            </button>

            <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            >
            ⬅ Anterior
            </button>

            <span>Página {currentPage} de {totalPages}</span>

            <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            >
            Siguiente ➡
            </button>

            <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            >
            Última ⏭
            </button>
            
        </div>
        
        )}
      <div className="gallery-grid">
        {paginatedItems.map((item) => (
          <div key={item._id} className="gallery-card" title={item.descripcion || ''}>
            {mediaType === 'image' ? (
              <img
              src={item.url}
              alt={item.titulo}
              onClick={() => item.hdurl && setZoomItem(item)}
              style={{ cursor: item.hdurl ? 'zoom-in' : 'default' }}
            />
            ) : (
              <iframe
                src={item.url}
                title={item.titulo}
                allow="fullscreen"
                frameBorder="0"
              />
            )}
            <h3>{item.titulo}</h3>
            {item.copyright && (
                <p className="gallery-copyright">
                    © {item.copyright}
                </p>
                )}

            <p>{formatDate(item.fecha)}</p>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="gallery-pagination">
            <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            >
            ⏮ Primera
            </button>

            <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            >
            ⬅ Anterior
            </button>

            <span>Página {currentPage} de {totalPages}</span>

            <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            >
            Siguiente ➡
            </button>

            <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            >
            Última ⏭
            </button>
        </div>
        )}
      {zoomItem && (
        <div className="zoom-overlay" onClick={() => setZoomItem(null)}>
            <button
            className="zoom-close-btn"
            onClick={(e) => {
                e.stopPropagation();
                setZoomItem(null);
            }}
            >
            ✖
            </button>
            <div className="zoom-content" onClick={(e) => e.stopPropagation()}>
            <img src={zoomItem.hdurl} alt={zoomItem.titulo} className="zoom-full" />
            <div className="zoom-caption">
                <h3>{zoomItem.titulo}</h3>
                {zoomItem.copyright && <p>© {zoomItem.copyright}</p>}
                <p>{formatDate(zoomItem.fecha)}</p>
            </div>
            </div>
        </div>
        )}
        <AdBanner />
    </div>
  );
}

export default NasaMediaGallery;
