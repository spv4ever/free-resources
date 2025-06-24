import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/KeikoIAGallery.css';

export default function KeikoIAGallery() {
  const [imagenesPorPack, setImagenesPorPack] = useState({});
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

useEffect(() => {
  axios.get(`${process.env.REACT_APP_API_URL}/api/public-images`)
    .then(res => {
      console.log('✅ Imagenes recibidas:', res.data);  // ← AÑADE ESTO
      setImagenesPorPack(res.data);
    })
    .catch(err => console.error('Error cargando imágenes públicas:', err));
}, []);

  return (
    <div className="keikoia-gallery">
      <h1 className="gallery-title">🧠 KeikoIA Imágenes</h1>

      {Object.entries(imagenesPorPack).map(([pack, imagenes]) => (
        <div key={pack} className="pack-section">
          <h2 className="pack-title">{pack}</h2>
          <div className="image-grid">
            {imagenes.map(img => (
              <div key={img._id} className="image-card" onClick={() => setImagenAmpliada(img)}>
                <img src={img.finalUrl} alt={img.promptScene} />
                <div className="image-info">
                  <span className="scene">{img.promptScene}</span>
                  <span className="author">👤 {img.nickname}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {imagenAmpliada && (
        <div className="modal-overlay" onClick={() => setImagenAmpliada(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setImagenAmpliada(null)}>×</button>

            <div className="modal-body">
              <img src={imagenAmpliada.finalUrl} alt="Imagen IA" className="modal-img" />
              <div className="modal-details">
                <h3>{imagenAmpliada.promptScene}</h3>
                <p><strong>Pack:</strong> {imagenAmpliada.packTitle}</p>
                <p><strong>Autor:</strong> {imagenAmpliada.nickname}</p>
                <p><strong>Fecha:</strong> {new Date(imagenAmpliada.createdAt).toLocaleString()}</p>
                <pre className="modal-prompt">{imagenAmpliada.prompt}</pre>
                <button onClick={() => navigator.clipboard.writeText(imagenAmpliada.finalUrl)}>
                  📋 Copiar URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
