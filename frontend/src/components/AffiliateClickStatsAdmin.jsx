import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AffiliateClickStatsAdmin.css';

function AffiliateClickStatsAdmin() {
  const [clickStats, setClickStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/affiliate-clicks/stats`);
        setClickStats(res.data);
      } catch (err) {
        console.error('Error cargando estadísticas de clics:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="ai-admin-container">
      <h2 className="ai-admin-title">📊 Estadísticas de Clics de Afiliados</h2>
      <table className="ai-admin-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Página</th>
            <th>Ubicación</th>
            <th>Clics</th>
            <th>Primero</th>
            <th>Último</th>
          </tr>
        </thead>
        <tbody>
          {clickStats.map((item) => (
            <tr key={item._id}>
              <td>{item.linkData.title}</td>
              <td>{item.linkData.page}</td>
              <td>{item.linkData.location}</td>
              <td>{item.totalClicks}</td>
              <td>{new Date(item.firstClick).toLocaleString()}</td>
              <td>{new Date(item.lastClick).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AffiliateClickStatsAdmin;
