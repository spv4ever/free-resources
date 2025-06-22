import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/UserImageGallery.css';
import { useUser } from '../context/UserContext';

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
      <h2>🖼 Tus imágenes generadas</h2>

      <div className="gallery-grid">
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
        <div className="modal-overlay" onClick={() => setImagenAmpliada(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setImagenAmpliada(null)}>×</button>
            <img src={imagenAmpliada.url} alt="Imagen ampliada" />
            <p>{new Date(imagenAmpliada.createdAt).toLocaleString()}</p>
            <pre className="prompt-preview">{imagenAmpliada.prompt}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserImageGallery;
