import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/UserImageGallery.css';
import { useUser } from '../context/UserContext';
import ScrollToTopButton from '../components/ScrollToTopButton';
import { FaXTwitter, FaFacebook, FaTelegram , FaRegCopy } from 'react-icons/fa6';

const UserImageGallery = () => {
  const { user, loading } = useUser();
  const [imagenes, setImagenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchImages = async (cursorParam = null) => {
    try {
      setCargando(true);
      const token = localStorage.getItem('token');
      const url = `${process.env.REACT_APP_API_URL}/api/upload/images/db${cursorParam ? `?cursor=${cursorParam}` : ''}`;

      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setImagenes(prev => [...prev, ...data.images]);
      setCursor(data.nextCursor || null);
      setHasMore(!!data.nextCursor);
    } catch (err) {
      console.error('❌ Error al cargar imágenes:', err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchImages();
    }
  }, [user, loading]);

  if (loading) return <div className="page-loader">⏳ Cargando usuario...</div>;
  if (!user) return <div className="restricted-area">🔐 Solo para usuarios registrados</div>;

  return (
    <div className="user-gallery-container">
      <div className="gallery-header">
        <h2>🖼 Tus imágenes generadas</h2>
        <button
          className="refresh-button"
          onClick={() => {
            setImagenes([]);
            setCursor(null);
            setHasMore(true);
            fetchImages(); // reinicia la carga desde el principio
          }}
        >
          🔄 Recargar
        </button>
      </div>

      <div className="gallery-grid-userimage">
        {imagenes.map((img, i) => (
          <div className="gallery-item" key={i}>
            <img src={img.url} alt={img.prompt} onClick={() => setImagenAmpliada(img)} />
            <span className="gallery-date">
              {img.createdAt ? new Date(img.createdAt).toLocaleDateString() : 'Sin fecha'}
            </span>
            <span className="gallery-date">{img.prompt.slice(0, 50)}…</span>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="gallery-load-more">
          <button className="load-more-btn" onClick={() => fetchImages(cursor)} disabled={cargando}>
            {cargando ? 'Cargando…' : 'Cargar más'}
          </button>
        </div>
      )}

      {!hasMore && imagenes.length > 0 && (
        <p className="no-more">📦 No hay más imágenes.</p>
      )}

      {imagenAmpliada && (
        <div className="modal-overlay-gallery" onClick={() => setImagenAmpliada(null)}>
          <div
            className="modal-content-gallery"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              gap: '1.5rem',
              maxWidth: '90vw',
              maxHeight: '90vh',
              width: '1000px',
              background: '#1e1e1e',
              padding: '1.5rem',
              borderRadius: '12px',
              overflow: 'auto',
            }}
          >
            <button
              className="modal-close"
              onClick={() => setImagenAmpliada(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                color: '#fff',
                fontSize: '1.5rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ×
            </button>

            {/* Imagen a la izquierda */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={imagenAmpliada.finalUrl || imagenAmpliada.url}
                alt="Imagen generada"
                style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }}
              />
            </div>

            {/* Información a la derecha */}
            <div style={{ flex: 1, color: '#fff', overflowY: 'auto' }}>
              <h3 style={{ marginBottom: '0.5rem', color: '#ffd859' }}>
                {imagenAmpliada.promptScene || 'Sin título'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#ccc' }}>
                Pack: <strong>{imagenAmpliada.packTitle || 'Desconocido'}</strong>
              </p>
              <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '1rem' }}>
                Generada el {new Date(imagenAmpliada.createdAt).toLocaleString()}
              </p>

              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '1rem', color: '#ffd859' }}>Prompt completo:</h4>
                <pre
                  className="prompt-preview-gallery"
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    background: '#2a2a2a',
                    padding: '1rem',
                    borderRadius: '8px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    fontSize: '0.85rem',
                  }}
                >
                  {imagenAmpliada.prompt}
                </pre>
                <div style={{ marginTop: '2rem' }}>
                  <h4 style={{ fontSize: '1rem', color: '#ffd859', textAlign: 'center' }}>Compartir imagen:</h4>
                  
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      marginTop: '0.75rem'
                    }}
                  >
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `📸 Imagen generada con KeikoPrompts\n\n"${imagenAmpliada.promptScene}" del pack ${imagenAmpliada.packTitle}\n\nVer imagen: ${imagenAmpliada.finalUrl || imagenAmpliada.url}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-button x"
                    >
                      <FaXTwitter /> X (texto + enlace)
                    </a>

                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        imagenAmpliada.finalUrl || imagenAmpliada.url
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-button facebook"
                    >
                      <FaFacebook /> Facebook
                    </a>

                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(
                        imagenAmpliada.finalUrl || imagenAmpliada.url
                      )}&text=${encodeURIComponent(
                        `📸 Imagen generada con KeikoPrompts\n"${imagenAmpliada.promptScene}" del pack ${imagenAmpliada.packTitle}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-button telegram"
                    >
                      <FaTelegram  /> Telegram
                    </a>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(imagenAmpliada.finalUrl || imagenAmpliada.url);
                        alert('✅ URL de la imagen copiada. ¡Ahora pégala en tu post de X!');
                      }}
                      className="social-button copy"
                    >
                      <FaRegCopy /> Copiar imagen para X
                    </button>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      )}


      <ScrollToTopButton />
    </div>
  );
};

export default UserImageGallery;
