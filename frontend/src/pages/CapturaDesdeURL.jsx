import { useState } from 'react';
import axios from 'axios';

export default function CapturaDesdeURL() {
  const [url, setUrl] = useState('');
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);

  const capturar = async () => {
    if (!url.startsWith('http')) return alert('Introduce una URL válida (debe comenzar con http o https)');
    setLoading(true);
    setImagen(null);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/captura-url`,
        { url },
        { responseType: 'blob' }
        );

      const blob = new Blob([response.data], { type: 'image/png' });
      const imageURL = URL.createObjectURL(blob);
      setImagen({ blob, url: imageURL });
    } catch (err) {
      alert('No se pudo capturar la URL. Asegúrate de que es accesible.');
    } finally {
      setLoading(false);
    }
  };

  const descargar = () => {
    if (!imagen) return;
    const a = document.createElement('a');
    a.href = imagen.url;
    a.download = 'captura.png';
    a.click();
  };

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: 16 }}>Captura desde URL</h1>
      <p style={{ marginBottom: 20 }}>
        Introduce la dirección de una página web para obtener una imagen del contenido visible.
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://ejemplo.com"
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid #ccc',
            borderRadius: 8,
            fontSize: 16,
          }}
        />
        <button
          onClick={capturar}
          disabled={loading}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#4f46e5',
            color: 'white',
            fontWeight: 'bold',
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? 'Capturando...' : 'Capturar'}
        </button>
      </div>

      {imagen && (
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: 12,
            padding: 16,
            textAlign: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
          }}
        >
          <img
            src={imagen.url}
            alt="Captura"
            style={{
              maxWidth: '100%',
              borderRadius: 8,
              marginBottom: 12,
              border: '1px solid #ccc',
            }}
          />
          <button
            onClick={descargar}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#16a34a',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Descargar imagen
          </button>
        </div>
      )}
    </div>
  );
}
