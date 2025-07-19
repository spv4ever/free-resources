import { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from './Toast';
import GifModal from './GifModal';
import { FaStar, FaRegStar } from 'react-icons/fa';

const GifCard = ({ gif, user, token, isFavorito: favoritoInicial }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isFavorito, setIsFavorito] = useState(false);

    useEffect(() => {
    setIsFavorito(favoritoInicial);
    }, [favoritoInicial]);

  const gifUrl = gif.media_formats.gif.url;
  const gifId = gif.id;
  const API_URL = process.env.REACT_APP_API_URL;

  const toggleFavorito = async () => {
    if (!token || !user) return;

    try {
      if (isFavorito) {
        await axios.delete(`${API_URL}/api/favoritos/${gifId}`, {
        headers: { Authorization: `Bearer ${token}` }
        });
        setToastMessage('Eliminado de favoritos');
      } else {
        await axios.post(`${API_URL}/api/favoritos`, {
            gifId: String(gifId),  // 👈 asegúrate de forzar a string
            url: gifUrl
            }, {
            headers: { Authorization: `Bearer ${token}` }
            });

        setToastMessage('Añadido a favoritos');
      }

      setIsFavorito(!isFavorito);
      setShowToast(true);
    } catch (err) {
      console.error('Error al marcar favorito', err);
    }
  };

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

  const handleDownload = async () => {
    try {
        const response = await fetch(gifUrl, { mode: 'cors' });
        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `keiko-gif-${gifId}.gif`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('❌ Error al descargar el GIF', error);
        setToastMessage('No se pudo descargar el GIF');
        setShowToast(true);
    }
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

      {/* Imagen del GIF */}
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

      {/* Botones de acción */}
      <div style={{
        marginTop: 'auto',
        padding: '0.0rem 0.0rem',
        borderTop: '1px solid #333',
        backgroundColor: '#111',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap', // por si hay muchos
        gap: '0rem',
        overflow: 'hidden'
        }}>
        <button
            onClick={toggleFavorito}
            disabled={!token || !user}
            title={token ? (isFavorito ? 'Eliminar de favoritos' : 'Añadir a favoritos') : 'Función solo para usuarios registrados'}
            style={{
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.2rem',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                transition: 'transform 0.15s ease',
                color: isFavorito ? '#ffca28' : '#888'
                }}
            
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
            >
            {isFavorito ? <FaStar /> : <FaRegStar />}
            </button>

        <button
          onClick={handleCopyUrl}
          title="Copiar URL"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '0.95rem',
            color: '#ccc',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.2rem',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            transition: 'transform 0.15s ease'
            }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        >
          🔗
        </button>
        {/* Descargar GIF */}
        <button
        onClick={() => {
            handleDownload();
        }}
        title="Descargar GIF"
        style={{
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '0.95rem',
            color: '#ccc',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.2rem',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            transition: 'transform 0.15s ease'
            }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        >
        ⬇️
        </button>

        {/* Compartir en Telegram */}
        <button
        onClick={() => {
            const url = `https://t.me/share/url?url=${encodeURIComponent(gifUrl)}`;
            window.open(url, '_blank');
        }}
        title="Compartir en Telegram"
        style={{
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '0.95rem',
            color: '#ccc',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.2rem',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            transition: 'transform 0.15s ease'
            }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        >
        📲
        </button>

        {/* Compartir en WhatsApp */}
        <button
        onClick={() => {
            const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(gifUrl)}`;
            window.open(url, '_blank');
        }}
        title="Compartir en WhatsApp"
        style={{
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '0.95rem',
            color: '#ccc',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.2rem',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            transition: 'transform 0.15s ease'
            }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        >
        💬
        </button>

        <button
          onClick={handleCopyIframe}
          title="Copiar iframe"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '0.95rem',
            color: '#ccc',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.rem',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            transition: 'transform 0.15s ease'
            }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        >
          &lt;/&gt;
        </button>
      </div>

      {/* Modal de vista previa */}
      {showModal && (
        <GifModal
          gifUrl={gifUrl}
          gifId={gifId}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Toast */}
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
