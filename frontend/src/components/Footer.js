import React from 'react';
import '../styles/Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom'; // 👈 Importante

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        <p>
          <FontAwesomeIcon icon={faEnvelope} />{' '}
          <a href="mailto:info@keikodev.es">info@keikodev.es</a>
        </p>
        <div className="social-links">
          <a href="https://x.com/keikodevfree" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faTwitter} /> Twitter
          </a>
          <a href="https://www.instagram.com/keikodevfree/" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faInstagram} /> Instagram
          </a>
        </div>
      </div>

      <div className="footer-center">
  <p>© 2025 KeikoDev - Todos los derechos reservados</p>
  <div className="footer-links-row">
    <Link to="/aviso-legal">Aviso Legal</Link>
    <span className="separator">|</span>
    <Link to="/privacidad">Política de Privacidad</Link>
    <span className="separator">|</span>
    <Link to="/cookies">Política de Cookies</Link>
    <span className="separator">|</span>
    <button
      onClick={() => localStorage.removeItem('cookieConsent') || window.location.reload()}
      className="cookie-button"
    >
      Cambiar preferencias de cookies
    </button>
  </div>
</div>
    </footer>
  );
}

export default Footer;
