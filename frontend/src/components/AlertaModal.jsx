import React from 'react';
import '../styles/AlertaModal.css';

export default function AlertaModal({ mensaje, onClose, link, imagen }) {
  return (
    <div className="alerta-overlay" onClick={onClose}>
      <div className="alerta-contenido" onClick={(e) => e.stopPropagation()}>
        <h3>⚠ Atención</h3>
        {imagen && <img src={imagen} alt="imagen alerta" className="alerta-imagen" />}
        <p>{mensaje}</p>
        {link && (
          <a className="alerta-link" href={link} target="_blank" rel="noopener noreferrer">
            Ver más información
          </a>
        )}
        <button className="alerta-boton oscuro" onClick={onClose}>Entendido</button>
      </div>
    </div>
  );
}
