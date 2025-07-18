import { useState, useEffect } from 'react';
import Toast from './Toast';

const backdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 999
};

const modalStyle = {
  backgroundColor: '#1e1e1e',
  borderRadius: '10px',
  padding: '1.5rem',
  maxWidth: '90vw',
  maxHeight: '90vh',
  textAlign: 'center',
  boxShadow: '0 0 20px rgba(0, 0, 0, 0.6)'
};

const GifModal = ({ gifUrl, gifId, onClose }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(gifUrl);
    setToastMessage('¡URL copiada al portapapeles!');
    setShowToast(true);
  };

  const handleCopyIframe = () => {
    const iframe = `<iframe src="https://tenor.com/embed/${gifId}" width="480" height="270" frameborder="0" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(iframe);
    setToastMessage('¡iframe copiado al portapapeles!');
    setShowToast(true);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <img
          src={gifUrl}
          alt="Vista previa"
          style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '6px' }}
        />
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
                onClick={handleCopy}
                style={{
                padding: '0.6rem 1rem',
                backgroundColor: '#007bff',
                color: '#fff',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
                }}
            >
                Copiar URL
            </button>
            <button
                onClick={handleCopyIframe}
                style={{
                padding: '0.6rem 1rem',
                backgroundColor: '#00b894',
                color: '#fff',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
                }}
            >
                Copiar iframe
            </button>
            <button
                onClick={onClose}
                style={{
                padding: '0.6rem 1rem',
                backgroundColor: '#444',
                color: '#fff',
                fontWeight: 'normal',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem'
                }}
            >
                Cerrar
            </button>
            </div>

        {showToast && (
          <Toast
            message={toastMessage}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </div>
  );
};

export default GifModal;
