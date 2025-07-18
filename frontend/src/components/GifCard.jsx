import { useState } from 'react';
import Toast from './Toast';
import GifModal from './GifModal';

const GifCard = ({ gif }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const gifUrl = gif.media_formats.gif.url;
  const gifId = gif.id;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(gifUrl);
    setToastMessage('¡URL copiada!');
    setShowToast(true);
  };

  const handleCopyIframe = () => {
    const iframe = `<iframe src="https://tenor.com/embed/${gifId}" width="480" height="270" frameborder="0" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(iframe);
    setToastMessage('¡iframe copiado!');
    setShowToast(true);
  };

  return (
    <div style={{
      backgroundColor: '#1e1e1e',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
      transition: 'transform 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      position: 'relative'
    }}>
      <img
        src={gifUrl}
        alt="GIF"
        onClick={() => setShowModal(true)}
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'contain',
          display: 'block',
          backgroundColor: '#000',
          cursor: 'pointer'
        }}
      />

      <div style={{
        marginTop: 'auto',
        padding: '0.5rem 0.75rem',
        borderTop: '1px solid #333',
        backgroundColor: '#111',
        display: 'flex',
        justifyContent: 'center',
        gap: '0.75rem'
        }}>
        <button
            onClick={handleCopyUrl}
            title="Copiar URL"
            style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#00aaff',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'transform 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        >
            🔗
        </button>

        <button
            onClick={handleCopyIframe}
            title="Copiar iframe"
            style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#00b894',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'transform 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        >
            &lt;/&gt;
        </button>
        </div>

      {showModal && (
        <GifModal
          gifUrl={gifUrl}
          gifId={gifId}
          onClose={() => setShowModal(false)}
        />
      )}

      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default GifCard;
