import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles//AffiliateBannerAndSidebar.css';
import { useLocation } from 'react-router-dom';

function AffiliateBannerAndSidebar() {
  const location = useLocation();
  const [banner, setBanner] = useState(null);
  const [sidebar, setSidebar] = useState(null);
  const [visible, setVisible] = useState(false);
  

useEffect(() => {
  if (sidebar) {
    const storageKey = `shown-sidebar-${location.pathname}`;
    if (!sessionStorage.getItem(storageKey)) {
      setTimeout(() => {
        setVisible(true);
        sessionStorage.setItem(storageKey, 'true');
      }, 8000);
    }
  }
}, [sidebar, location.pathname]);

  useEffect(() => {
    const fetchAffiliateLinks = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/affiliate-links`, {
          params: { page: location.pathname }
        });
        const links = res.data;
        setBanner(links.find(l => l.location === 'banner'));
        setSidebar(links.find(l => l.location === 'sidebar'));
      } catch (err) {
        console.error('Error al cargar enlaces de afiliado:', err);
      }
    };

    fetchAffiliateLinks();
  }, [location.pathname]);

  return (
    <>
     {banner && (
        <div className="affiliate-card-horizontal">
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="affiliate-card-img"
          />
          <div className="affiliate-card-content">
            <h3>{banner.title}</h3>
            <p>{banner.cta}</p>
            <a
              href={banner.url}
              className="cta-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver en Amazon
            </a>
          </div>
        </div>
      )}


      {sidebar && visible && (
        <div className="affiliate-sidebar">
            <button className="close-btn" onClick={() => setVisible(false)}>✖</button>
            <a href={sidebar.url} target="_blank" rel="noopener noreferrer">
            <img src={sidebar.imageUrl} alt={sidebar.title} className="affiliate-sidebar-img" />
            <div className="affiliate-sidebar-content">
                <h4>{sidebar.title}</h4>
                <span className="cta-button">{sidebar.cta}</span>
            </div>
            </a>
        </div>
        )}
    </>
  );
}

export default AffiliateBannerAndSidebar;
