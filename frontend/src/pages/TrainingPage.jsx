import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/TrainingPage.css';
import AdBanner from '../components/AdBanner';


function TrainingPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainingResources = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/training-resources`);
        setResources(res.data);
      } catch (err) {
        console.error('Error al cargar recursos de formación:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingResources();
  }, []);

 
  return (
    <div className="training-public-page">
      <AdBanner />
      <h2>Recursos de Formación</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="training-grid">
          {resources.map(resource => (
            <div className="training-card" key={resource._id}>
              <h3>{resource.titulo}</h3>
              <p className="descripcion">{resource.descripcion}</p>
              <p><strong>Plataforma:</strong> {resource.plataforma}</p>
              <p><strong>Tipo:</strong> {resource.tipo}</p>
              <p><strong>Dificultad:</strong> {resource.dificultad}</p>
              <p><strong>Idioma:</strong> {resource.idioma}</p>
              <p><strong>Duración:</strong> {resource.duracion}</p>
              {resource.gratuito ? (
                <p className="gratis">Gratis</p>
              ) : (
                <p className="precio">Precio: {resource.precio}</p>
              )}
              {resource.certificado && <p className="certificado">✅ Certificado disponible</p>}
              <a
                href={resource.url}
                className="training-link"
                target="_blank"
                rel="noreferrer"
              >
                Acceder al curso
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrainingPage;
