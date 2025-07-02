import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/PackImages.css';
import PromptImageModal from './PromptImageModal';
import { useUser } from '../context/UserContext'; // ajusta la ruta si es diferente

const PackImages = () => {
  const { packId } = useParams();
  const [imagenes, setImagenes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchImagenes = async () => {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/public-images/pack/${packId}?page=${page}`);
      setImagenes(data.images);
      setTotalPages(data.totalPages);
    };
    fetchImagenes();
  }, [packId, page]);

  return (
    <div className="packimages-container">
        <div className="packimages-header">
          <button onClick={() => window.history.back()} className="packimages-back-btn">
            ← Volver a la galería
          </button>

          <h2 className="packimages-title">Imágenes del Pack</h2>

          <div className="generador-center">
            <a
              href={`/prompts/${packId}`}
              className="generador-link-button"
              title="Ir al generador de prompts del pack"
              target="_blank"
              rel="noopener noreferrer"
            >
              🎨 Ir al generador
            </a>
          </div>
        </div>
        <div className="packimages-grid">
            {imagenes.map(img => (
            <div key={img._id} className="packimages-card" onClick={() => setImagenAmpliada(img)}>
                <img src={img.finalUrl} alt={img.promptScene} />
                <div className="packimages-info">
                <span className="scene">{img.promptScene}</span>
                <span className="author">👤 {img.nickname}</span>
                </div>
            </div>
            ))}
        </div>

        {totalPages > 1 && (
            <div className="packimages-pagination">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>Anterior</button>
                <span>Página {page} de {totalPages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Siguiente</button>
            </div>
            )}

        {imagenAmpliada && <PromptImageModal
            image={{ ...imagenAmpliada, isAdmin: user?.role === 'admin'}}
            onClose={() => setImagenAmpliada(null)}
          />
}
        </div>
  );
};

export default PackImages;
