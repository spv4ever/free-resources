import { useState, useEffect,useCallback  } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const API_BASE = process.env.REACT_APP_API_URL;

const AdminTempFiles = () => {
  const { token, user } = useUser();
  const [archivos, setArchivos] = useState([]);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  
  const fetchArchivos = useCallback(async () => {
    setError('');
    setMensaje('');
    setLoading(true);

    try {
      const { data } = await axios.get(`${API_BASE}/api/download/temp-files`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArchivos(data);
    } catch (err) {
      setError('No se pudo cargar la lista de archivos temporales.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleBorrarTodos = async () => {
    if (!window.confirm('¿Seguro que quieres eliminar todos los archivos temporales?')) return;

    try {
      const { data } = await axios.delete(`${API_BASE}/api/download/temp-files`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje(data.message || 'Archivos eliminados.');
      setArchivos([]);
    } catch (err) {
      setError('Error al intentar borrar los archivos.');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchArchivos();
    }
  }, [user, fetchArchivos]);

  if (!token || user?.role !== 'admin') return null;

  const styles = {
    container: {
      margin: '2rem auto',
      padding: '1.5rem',
      backgroundColor: '#1a1a1a',
      color: '#f0f0f0',
      borderRadius: '8px',
      maxWidth: '800px'
    },
    title: {
      fontSize: '1.5rem',
      marginBottom: '1rem'
    },
    button: {
      backgroundColor: '#ff4444',
      border: 'none',
      color: 'white',
      padding: '10px 16px',
      fontSize: '1rem',
      borderRadius: '6px',
      cursor: 'pointer',
      marginBottom: '1rem'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      backgroundColor: '#333',
      color: '#ddd',
      textAlign: 'left',
      padding: '10px'
    },
    td: {
      padding: '10px',
      borderBottom: '1px solid #444',
      fontSize: '0.95rem'
    },
    mensaje: {
      margin: '1rem 0',
      color: '#66ff66'
    },
    error: {
      margin: '1rem 0',
      color: '#ff5555'
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🗂️ Archivos Temporales Descargados</h3>

      {error && <p style={styles.error}>{error}</p>}
      {mensaje && <p style={styles.mensaje}>{mensaje}</p>}

      <button style={styles.button} onClick={handleBorrarTodos}>
        🧹 Borrar todos los archivos
      </button>

      {loading ? (
        <p>Cargando...</p>
      ) : archivos.length === 0 ? (
        <p>No hay archivos temporales actualmente.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Tamaño</th>
              <th style={styles.th}>Última modificación</th>
            </tr>
          </thead>
          <tbody>
            {archivos.map((a, i) => (
              <tr key={i}>
                <td style={styles.td}>{a.nombre}</td>
                <td style={styles.td}>{a.tamañoMB} MB</td>
                <td style={styles.td}>{new Date(a.modificado).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminTempFiles;
