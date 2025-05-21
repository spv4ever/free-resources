import React, { useEffect, useState } from 'react';
import axios from 'axios';

const IgraalDealHighlight = () => {
  const [deal, setDeal] = useState(null);

  useEffect(() => {
    const fetchRandomDeal = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/igraal-deals`);
        const all = res.data;
        if (all.length > 0) {
          const random = all[Math.floor(Math.random() * all.length)];
          setDeal(random);
        }
      } catch (err) {
        console.error('Error al cargar chollo aleatorio:', err);
      }
    };

    fetchRandomDeal();
  }, []);

  if (!deal) return null;

  return (
    <div className="card-home" style={{ textAlign: 'center' }}>
      <h2>🎁 Chollo del Día</h2>

      <img
        src={deal.imageUrl}
        alt={deal.title}
        style={{
          width: '100%',
          height: '200px',
          objectFit: 'contain',
          borderRadius: '10px',
          backgroundColor: '#000',
          marginBottom: '1rem'
        }}
      />

      <h3>{deal.title}</h3>
      <p style={{ color: '#ff9900', fontWeight: 'bold', marginBottom: '1rem' }}>
        {deal.cashback}
      </p>

      <a
        href={deal.url}
        className="cta-button"
        target="_blank"
        rel="noopener noreferrer"
        style={{ margin: '0 auto' }}
      >
        Ver en iGraal
      </a>
    </div>
  );
};

export default IgraalDealHighlight;
