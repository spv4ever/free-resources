import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../utils/api';
import PromptImageModal from '../components/PromptImageModal';
import '../styles/PromptImagesHistory.css';

const PromptImagesHistory = () => {
  const { promptId } = useParams();
  const [imagenes, setImagenes] = useState([]);
  const [modalImage, setModalImage] = useState(null);
  const [scene, setScene] = useState('');

  useEffect(() => {
    const fetchImagenes = async () => {
      try {
        const { data } = await API.get(`/api/keiko/prompts/historial-imagenes/${promptId}`);
        setImagenes(data);
        if (data.length > 0 && data[0].promptRef?.scene) {
          setScene(data[0].promptRef.scene);
        }
      } catch (err) {
        console.error('❌ Error al cargar imágenes del prompt:', err.message);
      }
    };

    fetchImagenes();
  }, [promptId]);

  return (
    <div className="historial-container">
      <h1>🖼️ {scene || 'Historial de Imágenes Generadas'}</h1>

      {imagenes.length === 0 ? (
        <p>No se han generado imágenes para este prompt aún.</p>
      ) : (
        <div className="historial-grid">
          {imagenes.map(img => (
            <div key={img._id} className="historial-item" onClick={() => {
              setModalImage({
                ...img,
                finalUrl: img.finalUrl || img.url,
                nickname: img.user?.nickname || 'Usuario desconocido',
                packTitle: img.promptRef?.packId?.title || 'Pack desconocido',
              });
            }}>
              <img src={img.finalUrl || img.url} alt={img.prompt?.slice(0, 50)} />
              <p className="fecha">{new Date(img.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {modalImage && (
        <PromptImageModal
          image={modalImage}
          onClose={() => setModalImage(null)}
        />
      )}
    </div>
  );
};

export default PromptImagesHistory;
