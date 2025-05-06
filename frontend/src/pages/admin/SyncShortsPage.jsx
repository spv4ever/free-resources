import React, { useState } from 'react';
import axios from 'axios';

function SyncShortsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    if (!window.confirm('¿Estás seguro de que quieres sincronizar los Shorts virales ahora?')) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/viral-shorts/admin/sync-viral-shorts`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMessage(res.data.message || 'Sincronización completada con éxito.');
    } catch (error) {
      console.error('Error al sincronizar:', error);
      setMessage('Error al sincronizar los shorts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <h2>Sincronizar Shorts Virales</h2>
      <p>Esto consultará la API de YouTube y actualizará los shorts virales para cada categoría configurada.</p>
      <button onClick={handleSync} disabled={loading}>
        {loading ? 'Sincronizando...' : '🔄 Ejecutar sincronización'}
      </button>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
}

export default SyncShortsPage;
