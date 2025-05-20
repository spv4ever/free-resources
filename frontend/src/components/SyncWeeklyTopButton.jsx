import React, { useState } from 'react';
import axios from 'axios';
import '../styles/SyncWeeklyTopButton.css'; // Estilo opcional

const SyncWeeklyTopButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/series/sync-weekly-now`);
      setMessage(res.data.message || 'Sincronización completada');
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Error al sincronizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sync-weekly-top">
      <button onClick={handleSync} disabled={loading}>
        {loading ? 'Sincronizando...' : '🔄 Sincronizar Top Semanal'}
      </button>
      {message && <p className="sync-message">{message}</p>}
    </div>
  );
};

export default SyncWeeklyTopButton;
