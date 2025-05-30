import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/IgraalDealHighlight.css';

const IgraalDealHighlight = () => {
  const [deal, setDeal] = useState(null);
  const navigate = useNavigate();

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

  const handleClickCard = () => {
    navigate('/chollos');
  };

  return (
    <div className="igraal-highlight-link" onClick={handleClickCard} style={{ cursor: 'pointer' }}>
      <div className="igraal-highlight-card">
        <h2>🎁 Chollo del Día</h2>

        <img
          src={deal.imageUrl}
          alt={deal.title}
          className="highlight-img"
        />

        <h3>{deal.title}</h3>
        <p className="highlight-cashback">{deal.cashback}</p>

        <a
          href={deal.url}
          className="cta-button"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()} // 👈 evita redirección al hacer click en el botón
        >
          Ver en iGraal
        </a>
      </div>
    </div>
  );
};

export default IgraalDealHighlight;
