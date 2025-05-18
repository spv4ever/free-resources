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

  const handleClick = async (link) => {
  try {
    await axios.post(`${process.env.REACT_APP_API_URL}/api/affiliate-clicks`, {
      linkId: link._id,
      page: location.pathname
    });
  } catch (err) {
    console.error('Error registrando clic:', err);
  } finally {
    window.open(link.url, '_blank');
  }
};

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
            <button className="cta-button" onClick={() => handleClick(banner)}>
              Ver en Amazon
            </button>
          </div>
        </div>
      )}


      {sidebar && visible && (
        <div className="affiliate-sidebar">
            <button className="close-btn" onClick={() => setVisible(false)}>✖</button>
            <div onClick={() => handleClick(sidebar)} className="affiliate-sidebar-link">
              <img src={sidebar.imageUrl} alt={sidebar.title} className="affiliate-sidebar-img" />
              <div className="affiliate-sidebar-content">
                <h4>{sidebar.title}</h4>
                <span className="cta-button">{sidebar.cta}</span>
              </div>
            </div>
        </div>
        )}
    </>
  );
}

export default AffiliateBannerAndSidebar;
