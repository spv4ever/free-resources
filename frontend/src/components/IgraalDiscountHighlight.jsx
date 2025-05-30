import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/IgraalDiscountHighlight.css';

const IgraalDiscountHighlight = () => {
  const [coupon, setCoupon] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRandomCoupon = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/igraal-coupons`);
        const all = res.data.filter(c => c.status === 'aceptado');
        if (all.length > 0) {
          const random = all[Math.floor(Math.random() * all.length)];
          setCoupon(random);
        }
      } catch (err) {
        console.error('Error al cargar descuento aleatorio:', err);
      }
    };

    fetchRandomCoupon();
  }, []);

  if (!coupon) return null;

  const getFavicon = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    } catch {
      return null;
    }
  };

  const logoSrc = coupon.sourceUrl ? getFavicon(coupon.sourceUrl) : null;

  const handleClickCard = () => {
    navigate('/cupones');
  };

  return (
    <div className="igraal-highlight-link" onClick={handleClickCard} style={{ cursor: 'pointer' }}>
      <div className="igraal-highlight-card">
        <h2>💸 Descuento del Día</h2>

        {logoSrc && (
          <img
            src={logoSrc}
            alt="Logo tienda"
            className="highlight-img-large"
          />
        )}

        <h3>{coupon.title}</h3>
        <p className="discount-description">{coupon.description}</p>

        {coupon.code && (
          <p className="discount-code">
            Código: {coupon.code}
          </p>
        )}

        <a
          href={coupon.url}
          className="cta-button"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          Usar en iGraal
        </a>

        {coupon.sourceUrl && (
          <a
            href={coupon.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="store-link"
            onClick={(e) => e.stopPropagation()}
          >
            Visita la tienda
          </a>
        )}
      </div>
    </div>
  );
};

export default IgraalDiscountHighlight;
