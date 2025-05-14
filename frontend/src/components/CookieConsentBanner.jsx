import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setTimeout(() => setVisible(true), 1000); // pequeña pausa para que aparezca suave
    }
  }, []);

  const handleConsent = (value) => {
    localStorage.setItem('cookieConsent', value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={popupContainer}>
      <div style={popupBox}>
        <p style={popupText}>
          Usamos cookies para mejorar tu experiencia. Al continuar, aceptas nuestra{' '}
          <Link to="/cookies" style={linkStyle}>Política de Cookies</Link>.
        </p>
        <div style={buttonGroup}>
          <button onClick={() => handleConsent('accepted')} style={{ ...buttonStyle, backgroundColor: '#28a745' }}>
            Aceptar
          </button>
          <button onClick={() => handleConsent('rejected')} style={{ ...buttonStyle, backgroundColor: '#dc3545' }}>
            Rechazar
          </button>
        </div>
      </div>
    </div>
  );
};

// Estilos
const popupContainer = {
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
  zIndex: 1000
};

const popupBox = {
  backgroundColor: '#1e1e1e',
  color: '#e0e0e0',
  borderRadius: '12px',
  padding: '1.2rem',
  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  maxWidth: '320px',
  fontFamily: 'sans-serif',
  animation: 'fadeIn 0.3s ease-in-out'
};

const popupText = {
  marginBottom: '1rem',
  fontSize: '0.95rem',
  lineHeight: '1.5'
};

const linkStyle = {
  color: '#00bfff',
  textDecoration: 'underline'
};

const buttonGroup = {
  display: 'flex',
  gap: '0.5rem',
  justifyContent: 'flex-end'
};

const buttonStyle = {
  border: 'none',
  color: '#fff',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '0.85rem'
};

export default CookieConsentBanner;
