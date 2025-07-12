// src/components/PromptImageModal.jsx
import React from 'react';
import '../styles/PromptImageModal.css';
import { FaXTwitter, FaFacebook, FaTelegram, FaRegCopy } from 'react-icons/fa6';
import { useUser } from '../context/UserContext'; // ajusta la ruta si es diferente

const API_URL = process.env.REACT_APP_API_URL; // ✅ Añadido aquí

const PromptImageModal = ({ image, onClose }) => {
  const { token } = useUser();
  if (!image) return null;

  return (
    <div className="promptmodal-overlay" onClick={onClose}>
      <div className="promptmodal-content" onClick={e => e.stopPropagation()}>
        <button className="promptmodal-close-btn" onClick={onClose}>×</button>

        <img src={image.finalUrl} alt="Imagen IA" className="promptmodal-img" />

        <div className="promptmodal-details">
          
          <h3>{image.promptScene}</h3>
          <p><strong>Pack:</strong> {image.packTitle}</p>
          <p><strong>Autor:</strong> {image.nickname}</p>
          <p><strong>Fecha:</strong> {new Date(image.createdAt).toLocaleString()}</p>
          <pre className="promptmodal-prompt">{image.prompt}</pre>
          <div className="promptmodal-share">
            <h4>Compartir imagen:</h4>
            <div className="promptmodal-social">
                <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `📸 Imagen generada con KeikoPrompts\n\n"${image.promptScene}" del pack ${image.packTitle}\n\nVer imagen: ${image.finalUrl || image.url}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-button x"
                >
                <FaXTwitter /> X (texto + enlace)
                </a>

                <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    image.finalUrl || image.url
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-button facebook"
                >
                <FaFacebook /> Facebook
                </a>

                <a
                href={`https://t.me/share/url?url=${encodeURIComponent(
                    image.finalUrl || image.url
                )}&text=${encodeURIComponent(
                    `📸 Imagen generada con KeikoPrompts\n"${image.promptScene}" del pack ${image.packTitle}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-button telegram"
                >
                <FaTelegram /> Telegram
                </a>

                <button
                onClick={() => {
                    navigator.clipboard.writeText(image.finalUrl || image.url);
                    alert('✅ URL de la imagen copiada. ¡Ahora pégala en tu post de X!');
                }}
                className="social-button copy"
                >
                <FaRegCopy /> Copiar imagen para X
                </button>
                {image.isAdmin && (
                  <button
                    className="promptmodal-delete-btn"
                    onClick={async () => {
                      if (!window.confirm('¿Estás seguro de que quieres eliminar esta imagen?')) return;

                      try {
                        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/imagenes/${image._id}`, {
                          method: 'DELETE',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                          },
                        });

                        const data = await res.json();

                        if (res.ok) {
                          alert('✅ Imagen eliminada correctamente.');
                          onClose();
                        } else {
                          alert('❌ Error al eliminar imagen: ' + data.message);
                        }
                      } catch (error) {
                        alert('❌ Error inesperado al eliminar imagen.');
                        console.error(error);
                      }
                    }}
                  >
                    🗑️ Eliminar imagen
                  </button>
                )}
                <button
                  className="social-button telegram no-conflict"
                  onClick={async () => {
                    const confirmed = window.confirm('¿Compartir esta imagen en Telegram?');
                    if (!confirmed) return;

                    const res = await fetch(`${API_URL}/api/telegram/to-telegram-from-db`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        prompt_id: image.prompt_id || image._id,
                        finalUrl: image.finalUrl || image.url,
                        nickname: image.nickname,
                        prompt: image.prompt, 
                        createdAt: image.createdAt
                      }),
                    });

                    const data = await res.json();
                    if (res.ok && data.success) {
                      alert('✅ Imagen compartida en Telegram.');
                    } else {
                      alert('❌ Error: ' + data.message);
                    }
                  }}
                >
                  <FaTelegram /> Compartir en Telegram
                </button>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PromptImageModal;
