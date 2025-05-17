import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AffiliatePopup.css';

const AffiliatePopup = ({ currentPath }) => {
  const [link, setLink] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
  const fetchPopupLink = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/affiliate-links`, {
        params: { page: currentPath }
      });

      const popups = res.data.filter(l => l.location === 'popup');
      if (popups.length > 0) {
        const selected = popups[0];
        setLink(selected);

        //setVisible(true); // Mostrar al instante para depurar
        const storageKey = `shown-popup-${currentPath}`;
        const alreadyShown = sessionStorage.getItem(storageKey);

        if (!alreadyShown) {
        setTimeout(() => {
            setVisible(true);
            sessionStorage.setItem(storageKey, 'true');
        }, 8000);
        }
      }
    } catch (err) {
      console.error('Error al cargar el popup de afiliado:', err);
    }
  };

  fetchPopupLink();
}, [currentPath]);

  if (!visible || !link) return null;

  return (
    <div className="affiliate-popup">
      <button className="close-btn" onClick={() => setVisible(false)}>✖</button>
      <img src={link.imageUrl} alt={link.title} className="popup-image" />
      <h4>{link.title}</h4>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="popup-cta amazon-btn"
        >
        <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
            alt="Amazon"
            className="amazon-logo"
        />
        Ver en Amazon
        </a>
    </div>
  );
};

export default AffiliatePopup;
