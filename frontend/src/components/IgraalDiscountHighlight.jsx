import React, { useEffect, useState } from 'react';
import axios from 'axios';

const IgraalDiscountHighlight = () => {
  const [coupon, setCoupon] = useState(null);

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

  return (
    <div className="card-home" style={{ textAlign: 'center' }}>
      <h2>💸 Descuento del Día</h2>

      {logoSrc && (
        <img
          src={logoSrc}
          alt="Logo tienda"
          style={{
            width: '160px',
            height: '160px',
            objectFit: 'contain',
            borderRadius: '10px',
            backgroundColor: '#000',
            margin: '0 auto 1rem'
          }}
        />
      )}

      <h3>{coupon.title}</h3>
      <p style={{ fontStyle: 'italic', margin: '0.5rem 0' }}>{coupon.description}</p>

      {coupon.code && (
        <p style={{ color: '#ff9900', fontWeight: 'bold', marginBottom: '1rem' }}>
          Código: {coupon.code}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <a
          href={coupon.url}
          className="cta-button"
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginBottom: '0.75rem' }}
        >
          Usar en iGraal
        </a>

        {coupon.sourceUrl && (
          <a
            href={coupon.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.9rem',
              color: '#66b3ff',
              textDecoration: 'none'
            }}
          >
            Visita la tienda
          </a>
        )}
      </div>
    </div>
  );
};

export default IgraalDiscountHighlight;
