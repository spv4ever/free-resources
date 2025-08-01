import React, { useEffect, useState } from 'react';

const ProjectInfoPopup = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('keiko_info_accepted');
    if (!hasAccepted) {
      setShowPopup(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('keiko_info_accepted', 'true');
    setShowPopup(false);
  };

  const handleReject = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!showPopup) return null;

  return (
    <div style={popupOverlay}>
      <div style={popupBox}>
        <h2>KeikoPrompts es un proyecto abierto y gratuito 🧠✨</h2>
        <p>
          Esta plataforma es amateur, sin ánimo de lucro, cualquier persona puede registrarse y usarla gratis.
          Las funciones PRO no se compran, se desbloquean con tu ayuda y participación desinteresada en el desarrollo del proyecto.
        </p>
        <p style={{ fontStyle: 'italic', color: '#888' }}>
          Al continuar navegando aceptas estas condiciones. ¡Gracias por formar parte!
        </p>
        <div style={buttonGroup}>
          <button onClick={handleAccept} style={acceptButton}>
            Entendido
          </button>
          <button onClick={handleReject} style={rejectButton}>
            No aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

const popupOverlay = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

const popupBox = {
  backgroundColor: '#1f2937',
  color: '#f9fafb',
  padding: '2rem',
  borderRadius: '1rem',
  maxWidth: '500px',
  textAlign: 'center',
  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
};

const buttonGroup = {
  marginTop: '1.5rem',
  display: 'flex',
  justifyContent: 'center',
  gap: '1rem',
};

const acceptButton = {
  padding: '0.8rem 1.5rem',
  fontWeight: 'bold',
  fontSize: '1rem',
  backgroundColor: '#10b981',
  color: '#fff',
  border: 'none',
  borderRadius: '0.5rem',
  cursor: 'pointer',
};

const rejectButton = {
  padding: '0.8rem 1.5rem',
  fontWeight: 'bold',
  fontSize: '1rem',
  backgroundColor: '#ef4444',
  color: '#fff',
  border: 'none',
  borderRadius: '0.5rem',
  cursor: 'pointer',
};

export default ProjectInfoPopup;
