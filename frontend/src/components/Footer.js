import React from 'react';
import '../styles/Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import tmdbLogo from '../assets/tmdb.svg';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
  LinkedinIcon,
} from 'react-share';

function Footer() {
  const url = window.location.href;
  const title = 'Descubre KeikoDev Recursos: herramientas, series y más';
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

      <div className="footer-right">
        <p className="tmdb-text">
          This product uses the TMDb API but is not endorsed or certified by TMDb.
        </p>
          <img
            src={tmdbLogo}
            alt="TMDb Logo"
            className="tmdb-logo"
          />
      </div>
      <div className="footer-share">
      <p>📢 ¡Comparte esta página!</p>
      <div className="footer-share-icons">
        <FacebookShareButton url={url} quote={title}><FacebookIcon size={32} round /></FacebookShareButton>
        <TwitterShareButton url={url} title={title}><TwitterIcon size={32} round /></TwitterShareButton>
        <WhatsappShareButton url={url} title={title}><WhatsappIcon size={32} round /></WhatsappShareButton>
        <TelegramShareButton url={url} title={title}><TelegramIcon size={32} round /></TelegramShareButton>
        <LinkedinShareButton url={url}><LinkedinIcon size={32} round /></LinkedinShareButton>
      </div>
    </div>
    </footer>
  );
}

export default Footer;
