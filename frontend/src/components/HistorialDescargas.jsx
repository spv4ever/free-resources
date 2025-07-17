import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const API_BASE = process.env.REACT_APP_API_URL;

const HistorialDescargas = () => {
  const { token } = useUser();
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchHistorial = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/download/historial`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });
        setHistorial(data);
      } catch (err) {
        setError('No se pudo cargar tu historial.');
      }
    };

    fetchHistorial();
  }, [token]);

  const copiarURL = (url) => {
    navigator.clipboard.writeText(url);
    setMensaje('🔗 URL copiada al portapapeles.');
  };

  if (!token) return null;

  const styles = {
    container: {
      marginTop: '3rem',
      backgroundColor: '#1a1a1a',
      borderRadius: '8px',
      padding: '1.5rem',
      color: '#f1f1f1'
    },
    title: {
      fontSize: '1.5rem',
      marginBottom: '1rem'
    },
    tableWrapper: {
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.95rem'
    },
    th: {
      padding: '10px',
      borderBottom: '1px solid #333',
      textAlign: 'left',
      backgroundColor: '#222',
      color: '#bbb',
      fontWeight: 600
    },
    td: {
      padding: '10px',
      borderBottom: '1px solid #333'
    },
    button: {
      backgroundColor: '#00bfff',
      border: 'none',
      color: '#fff',
      padding: '6px 12px',
      fontSize: '0.9rem',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    thumbnail: {
      height: '50px',
      borderRadius: '4px'
    },
    fallback: {
      fontSize: '0.9rem',
      color: '#aaa'
    },
    error: {
      color: '#ff4d4d'
    },
    mensaje: {
      marginTop: '1rem',
      fontStyle: 'italic',
      color: '#00ffaa'
    },
    empty: {
      color: '#aaa'
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📜 Historial de Descargas</h3>
      {error && <p style={styles.error}>{error}</p>}
      {mensaje && <p style={styles.mensaje}>{mensaje}</p>}

      {historial.length === 0 ? (
        <p style={styles.empty}>No has realizado descargas aún.</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Miniatura</th>
                <th style={styles.th}>Título</th>
                <th style={styles.th}>Plataforma</th>
                <th style={styles.th}>Formato</th>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Copiar URL</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((item, index) => (
                <tr key={index}>
                  <td style={styles.td}>
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt="thumb"
                        style={styles.thumbnail}
                        onError={(e) => (e.target.style.display = 'none')}
                      />
                    ) : (
                      <span style={styles.fallback}>Sin imagen</span>
                    )}
                  </td>
                  <td style={styles.td}>{item.title}</td>
                  <td style={styles.td}>{item.platform}</td>
                  <td style={styles.td}>{item.format}</td>
                  <td style={styles.td}>{new Date(item.downloadedAt).toLocaleString()}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.button}
                      onClick={() => copiarURL(item.url)}
                    >
                      Copiar URL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistorialDescargas;
