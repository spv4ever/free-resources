import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/KeikoIAGallery.css';
import PromptImageModal from '../components/PromptImageModal';
import { useUser } from '../context/UserContext'; // ajusta la ruta si es diferente



export default function KeikoIAGallery() {
  const [imagenesPorPack, setImagenesPorPack] = useState({});
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const { user } = useUser();

useEffect(() => {
  axios.get(`${process.env.REACT_APP_API_URL}/api/public-images`)
    .then(res => {
      // console.log('✅ Imagenes recibidas:', res.data);  // ← AÑADE ESTO
      setImagenesPorPack(res.data);
    })
    .catch(err => console.error('Error cargando imágenes públicas:', err));
}, []);
// console.log('🧪 user:', user);
// console.log('🧪 user?.isAdmin:', user?.isAdmin);
  return (
    <div className="keikoia-gallery">
      <h1 className="gallery-title">🧠 KeikoIA Imágenes</h1>
      

      {Object.entries(imagenesPorPack).map(([pack, imagenes]) => (
        <div key={pack} className="pack-section">
          <h2 className="pack-title">
            {pack}
            {imagenes[0]?.packId && (
              <span className="pack-links">
                <a
                  href={`/biblioteca/pack/${imagenes[0].packId}`}
                  className="pack-link"
                  title="Ver todas las imágenes del pack"
                >
                  🔍 Ver todas
                </a>
                <a
                  href={`/prompts/${imagenes[0].packId}`}
                  className="pack-link"
                  title="Ir al generador de prompts del pack"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🎨 Generar
                </a>
              </span>
            )}
          </h2>
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

      {imagenAmpliada && <PromptImageModal
            image={{ ...imagenAmpliada, isAdmin: user?.role === 'admin' }}
            onClose={() => setImagenAmpliada(null)}
          />}
    </div>
  );
}
