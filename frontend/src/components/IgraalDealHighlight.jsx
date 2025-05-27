import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/IgraalDealHighlight.css';

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
    <Link to="/chollos" className="igraal-highlight-link">
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
          onClick={(e) => e.stopPropagation()} // 👈 evita que el click abra /chollos
        >
          Ver en iGraal
        </a>
      </div>
    </Link>
  );
};

export default IgraalDealHighlight;
