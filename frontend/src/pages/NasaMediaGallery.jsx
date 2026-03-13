import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/NasaGallery.css';
import { useLocation } from 'react-router-dom';
import AffiliatePopup from '../components/AffiliatePopup';

function NasaMediaGallery({ mediaType }) {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [zoomItem, setZoomItem] = useState(null);
  const [shareItem, setShareItem] = useState(null);
  const [shareText, setShareText] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const location = useLocation();
  const topRef = useRef(null);

  const formatDate = (fechaIso) => {
    const [a, m, d] = fechaIso.split('-');
    return `${d}/${m}/${a}`;
  };

  const buildInstagramPost = (item) => {
    const fecha = item?.fecha ? formatDate(item.fecha) : '';
    const titulo = item?.titulo?.trim() || 'NASA';
    const desc = (item?.descripcion || '').trim();
    const creditos = item?.copyright?.trim() || 'NASA/APOD';
    const isVideo = item?.media_type === 'video';

    const cta = '👉 Descubre más en keikodev.es';
    const hashtags = '#NASA #APOD #Space #Universe #Cosmos #Astronomy #Astrophotography #Galaxy #Stars #Nebula #Science #KeikoDev';
    const videoInfo = isVideo && item?.url ? `\n🔗 Vídeo: ${item.url}` : '';

    return (
  `📷 ${titulo}
  🗓️ ${fecha}
  © Créditos: ${creditos}

  ${desc}

  ${videoInfo}
  ${cta}

  ${hashtags}`
    ).replace(/\n{3,}/g, '\n\n');
  };

  const openShareForItem = (item) => {
    const post = buildInstagramPost(item);
    setShareItem(item);
    setShareText(post);
    setShowShareModal(true);
  };

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = shareText;
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('No se pudo copiar:', err);
      alert('No se pudo copiar automáticamente. Selecciona el texto y copia manualmente.');
    }
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
      if (e.key === 'Escape') {
        setZoomItem(null);
        setShowShareModal(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const shareToday = () => {
    if (items.length > 0) openShareForItem(items[0]);
  };

  const downloadViaProxy = (item) => {
    const src = item.hdurl || item.url;
    const base = (item.titulo || 'nasa-image').replace(/[^\w-]+/g, '_').slice(0,80);
    const href = `${process.env.REACT_APP_API_URL}/api/nasa-images/download?src=${encodeURIComponent(src)}&filename=${encodeURIComponent(base)}`;

    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  return (
    <div className="nasa-gallery" ref={topRef}>
      <AffiliatePopup currentPath={location.pathname} />

      <div className="gallery-header">
        <h2 className="gallery-title">
          {mediaType === 'image' ? 'Fotos del universo' : 'Videos del universo'}
        </h2>

        {/* Botón rápido para compartir la última (más reciente) */}
        {items.length > 0 && (
          <button
            className="share-today-btn"
            onClick={shareToday}
            title="Abrir post de la imagen/vídeo más reciente"
          >
            📣 Compartir la de hoy
          </button>
        )}
      </div>

      {totalPages > 1 && (
        <div className="gallery-pagination">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>⏮ Primera</button>
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>⬅ Anterior</button>
          <span>Página {currentPage} de {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Siguiente ➡</button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Última ⏭</button>
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
              <p className="gallery-copyright">© {item.copyright}</p>
            )}
            <p>{formatDate(item.fecha)}</p>

            <div className="gallery-actions">
              {/* Zoom solo si hay hdurl en imágenes */}
              {mediaType === 'image' && item.hdurl && (
                <button
                  className="zoom-btn"
                  onClick={() => setZoomItem(item)}
                  title="Ver en grande"
                >
                  🔍 Zoom
                </button>
              )}
              {mediaType === 'image' && (
                <button
                  className="download-btn"
                  onClick={() => downloadViaProxy({ ...item, url: item.hdurl || item.url })}
                  title="Descargar imagen"
                >
                  ⬇ Descargar
                </button>
              )}
              {/* Nuevo botón Compartir */}
              <button
                className="share-btn"
                onClick={() => openShareForItem(item)}
                title="Generar post para Instagram"
              >
                📣 Compartir
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="gallery-pagination">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>⏮ Primera</button>
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>⬅ Anterior</button>
          <span>Página {currentPage} de {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Siguiente ➡</button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Última ⏭</button>
        </div>
      )}

      {/* Zoom overlay */}
      {zoomItem && (
        <div className="zoom-overlay" onClick={() => setZoomItem(null)}>
          <button
            className="zoom-close-btn"
            onClick={(e) => { e.stopPropagation(); setZoomItem(null); }}
          >
            ✖
          </button>
          <div className="zoom-content" onClick={(e) => e.stopPropagation()}>
            <img src={zoomItem.hdurl} alt={zoomItem.titulo} className="zoom-full" />
            <div className="zoom-caption">
              <h3>{zoomItem.titulo}</h3>
              {zoomItem.copyright && <p>© {zoomItem.copyright}</p>}
              <p>{formatDate(zoomItem.fecha)}</p>
              <div className="zoom-actions">
                <button className="share-btn" onClick={() => openShareForItem(zoomItem)}>📣 Compartir esta</button>
                <button className="download-btn" onClick={() => downloadViaProxy({ ...zoomItem, url: zoomItem.hdurl || zoomItem.url })}>⬇ Descargar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-backdrop" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Post para Instagram</h3>
              <button className="share-close" onClick={() => setShowShareModal(false)}>✖</button>
            </div>

            <div className="share-meta">
              {shareItem?.media_type === 'image' ? (
                <img src={shareItem.url} alt={shareItem.titulo} />
              ) : (
                <div className="share-video-thumb">🎬 Vídeo</div>
              )}
              <div className="share-meta-text">
                <strong>{shareItem?.titulo}</strong>
                <small>{shareItem?.fecha ? formatDate(shareItem.fecha) : ''}</small>
                {shareItem?.copyright && <small>© {shareItem.copyright}</small>}
              </div>
            </div>

            <textarea
              className="share-textarea"
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              spellCheck={false}
            />

            <div className="share-actions">
              <button className="copy-btn" onClick={copyToClipboard}>📋 Copiar al portapapeles</button>
              <button className="close-btn" onClick={() => setShowShareModal(false)}>Cerrar</button>
            </div>

            {copied && <div className="copy-toast">¡Copiado al portapapeles!</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default NasaMediaGallery;
