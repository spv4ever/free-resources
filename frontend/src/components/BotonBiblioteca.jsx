// src/components/BotonBiblioteca.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BotonBiblioteca.css'; // Asegúrate de tener este CSS

export default function BotonBiblioteca() {
  const navigate = useNavigate();
  return (
    <button className="library-btn" onClick={() => navigate('/mis-imagenes')}>
      📁 Ver biblioteca de imágenes
    </button>
  );
}
