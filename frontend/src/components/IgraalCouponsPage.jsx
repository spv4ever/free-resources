import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/IgraalCouponsPage.css';
import { useUser } from '../context/UserContext';

function IgraalCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/igraal-coupons`);
        // Ordenar por fecha descendente
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCoupons(sorted);
      } catch (err) {
        console.error('Error al cargar cupones de iGraal:', err);
      }
    };

    fetchCoupons();
  }, []);

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="igraal-coupons-container">
      <h1 className="igraal-coupons-title">🎟️ Códigos Descuento iGraal</h1>
      <p className="igraal-coupons-sub">Usa estos códigos y consigue cashback adicional por tus compras online.</p>

      <div className="igraal-coupons-grid">
        {coupons.map((coupon, index) => (
          <div className="igraal-coupon-card" key={index}>
            <h3>{coupon.title}</h3>
            <p className="coupon-description">{coupon.description}</p>
            
            <p className="coupon-code">
              Código:{" "}
              {user ? (
                <strong>{coupon.code}</strong>
              ) : (
                <button
                  className="show-code-button"
                  onClick={() => window.location.href = '/login'}
                >
                  Mostrar
                </button>
              )}
            </p>
            <a
              href={coupon.url}
              className="cta-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              Usar código en iGraal
            </a>
            {coupon.sourceUrl && (
              <a
                href={coupon.sourceUrl}
                className="cta-button secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ir a {coupon.title}
              </a>
              
            )}
            <p className="coupon-date">📅 Añadido el: {formatDate(coupon.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IgraalCouponsPage;
