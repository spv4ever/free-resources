// src/components/PromptImageModal.jsx
import React from 'react';
import '../styles/PromptImageModal.css';
import { FaXTwitter, FaFacebook, FaTelegram, FaRegCopy } from 'react-icons/fa6';


const PromptImageModal = ({ image, onClose }) => {
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
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PromptImageModal;
