import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import '../styles/YoutubeUploadHistory.css'; // opcional si deseas estilos propios

function YoutubeUploadHistory({ reload }) {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
        try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/youtube/history`, {
            headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        setUploads(res.data.uploads);
        } catch (err) {
        console.error('Error al obtener historial:', err);
        } finally {
        setLoading(false);
        }
    };

    fetchHistory();
    setAnimate(true);
    setTimeout(() => setAnimate(false), 1000); // animación de 1 segundo
    }, [reload]); // <- ✅ aquí se fuerza la recarga

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/youtube/history`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUploads(res.data.uploads);
      } catch (err) {
        console.error('Error al obtener historial:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <p>Cargando historial...</p>;

  return (
    <div className={`history-table ${animate ? 'animate-flash' : ''}`}>
      <h3>📄 Historial de Subidas</h3>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Video ID</th>
            <th>Canal</th>
            <th>Enlace</th>
          </tr>
        </thead>
        <tbody>
          {uploads.map((upload, index) => (
            <tr key={index}>
              <td>{dayjs(upload.uploadDate).format('YYYY-MM-DD HH:mm')}</td>
              <td>{upload.videoId}</td>
              <td>{upload.channelId}</td>
              <td>
                <a
                  href={`https://youtu.be/${upload.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default YoutubeUploadHistory;
