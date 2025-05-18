import React, { useEffect, useState } from 'react';
import axios from 'axios';
import IgraalInfoSection from '../components/IgraalInfoSection';
import '../styles/IgraalDealsPage.css';

function IgraalDealsPage() {
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/igraal-deals`);
        setDeals(res.data);
      } catch (err) {
        console.error('Error al cargar los chollos iGraal:', err);
      }
    };

    fetchDeals();
  }, []);

  return (
    <div className="igraal-page-container">
      <h1 className="igraal-page-title">💸 Chollos con Cashback en iGraal</h1>
      <p className="igraal-page-sub">Regístrate gratis y ahorra con nuestras ofertas destacadas:</p>
      <div className="igraal-page-grid">
        
        {deals.map((deal, i) => (
          <div className="igraal-page-card" key={i}>
            <img src={deal.imageUrl} alt={deal.title} className="igraal-page-img" />
            <h3>{deal.title}</h3>
            <p className="cashback">{deal.cashback}</p>
            <a
              href={deal.url}
              className="cta-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver en iGraal
            </a>
          </div>
        ))}
      </div>
      <IgraalInfoSection />
      

    </div>
  );
}

export default IgraalDealsPage;
