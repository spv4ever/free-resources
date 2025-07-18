import { useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import HistorialDescargas from '../components/HistorialDescargas';

const API_BASE = process.env.REACT_APP_API_URL;

const DescargasPage = () => {
  const { token } = useUser();
  const [url, setUrl] = useState('');
  const [formato, setFormato] = useState('mp4');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const detectarPlataforma = (link) => {
    try {
      const hostname = new URL(link).hostname;
      if (hostname.includes('youtube')) return 'YouTube';
      if (hostname.includes('instagram')) return 'Instagram';
      if (hostname.includes('tiktok')) return 'TikTok';
      if (hostname.includes('twitter') || hostname.includes('x.com')) return 'X';
      return 'Desconocida';
    } catch {
      return 'Desconocida';
    }
  };

  const handleDescargar = async () => {
    setLoading(true);
    setError('');
    setResultados([]);

    try {
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        : { withCredentials: true };

      const { data } = await axios.post(`${API_BASE}/api/download`, { url, formato }, config);

      if (data.archivos?.length) {
        setResultados(data.archivos);
      } else {
        setError('No se encontraron archivos para descargar.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar el enlace.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (filename) => {
    window.open(`${API_BASE.replace('/api', '')}/zip/${filename}`, '_blank');
  };

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#1a1a1a',
      borderRadius: '8px',
      color: '#f1f1f1'
    },
    title: {
      fontSize: '1.8rem',
      marginBottom: '1.5rem'
    },
    input: {
      width: '100%',
      padding: '10px',
      fontSize: '1rem',
      borderRadius: '4px',
      border: '1px solid #ccc',
      marginBottom: '1rem'
    },
    selectWrapper: {
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    button: {
      backgroundColor: '#00bfff',
      color: '#fff',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem'
    },
    error: {
      color: '#ff4d4d',
      marginTop: '1rem'
    },
    resultado: {
      marginTop: '2rem',
      border: '1px solid #333',
      padding: '1rem',
      borderRadius: '6px',
      backgroundColor: '#222'
    },
    img: {
      maxWidth: '100%',
      borderRadius: '4px',
      marginTop: '0.5rem'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📥 Descargar video o audio</h2>

      <input
        type="text"
        placeholder="Pega el enlace aquí..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={styles.input}
      />

      <div style={styles.selectWrapper}>
        <strong>Formato:</strong>
        <select value={formato} onChange={(e) => setFormato(e.target.value)}>
          <option value="mp4">MP4 (video)</option>
          <option value="mp3">MP3 (audio)</option>
          <option value="best">Alta calidad</option>
        </select>
      </div>

      <p><strong>Plataforma detectada:</strong> {url ? detectarPlataforma(url) : '—'}</p>

      <button onClick={handleDescargar} disabled={!url || loading} style={styles.button}>
        {loading ? 'Procesando...' : 'Descargar'}
      </button>

      {error && <p style={styles.error}>{error}</p>}

      {resultados.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>✅ Archivos disponibles ({resultados.length}):</h3>
          {resultados.map((item, index) => {
            const isInstagram = item.platform === 'Instagram';
            const isValidThumbnail = item.info?.thumbnail?.startsWith('https://') && !isInstagram;
            const fallbackImage = 'https://keikodev.es/static/img/preview-instagram.jpg';

            return (
              <div key={index} style={styles.resultado}>
                <h4>{item.info?.title}</h4>
                {isValidThumbnail ? (
                  <img src={item.info.thumbnail} alt="thumbnail" style={styles.img} />
                ) : isInstagram ? (
                  <img src={fallbackImage} alt="preview instagram" style={styles.img} />
                ) : null}
                <p><strong>Plataforma:</strong> {item.platform}</p>
                <button onClick={() => handleDownload(item.filename)} style={styles.button}>
                  Descargar archivo
                </button>
              </div>
            );
          })}
        </div>
      )}

      <HistorialDescargas />
    </div>
  );
};

export default DescargasPage;
