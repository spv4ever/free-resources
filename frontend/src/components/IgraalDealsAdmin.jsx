import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/IgraalDealsAdmin.css';

function IgraalDealsAdmin() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDeals = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/igraal-deals`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDeals(res.data);
    } catch (err) {
      console.error('Error al cargar los chollos iGraal:', err);
    }
  };


  const handleManualFetch = async () => {
    setLoading(true);
    try {
      await axios.get(`${process.env.REACT_APP_API_URL}/api/igraal-deals/fetch`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await fetchDeals();
    } catch (err) {
      console.error('Error al actualizar manualmente los chollos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  return (
    <div className="ai-admin-container">
      <h2 className="ai-admin-title">🔥 Chollos iGraal Recientes</h2>
      <button className="cta-button" onClick={handleManualFetch} disabled={loading}>
        {loading ? 'Actualizando...' : '🔄 Actualizar chollos manualmente'}
      </button>
      <div className="igraal-grid">
        {deals.map((deal, i) => (
          <div className="igraal-card" key={i}>
            <img src={deal.imageUrl} alt={deal.title} className="igraal-logo" />
            <h3>{deal.title}</h3>
            <p className="cashback">{deal.cashback}</p>
            <a
              href={deal.url}
              className="cta-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver oferta
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IgraalDealsAdmin;
