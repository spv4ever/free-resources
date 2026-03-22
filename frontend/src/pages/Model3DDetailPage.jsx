import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import '../styles/Model3DDetailPage.css';

function Model3DDetailPage() {
  const { slug } = useParams();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/models-3d/slug/${slug}`);
        setModel(response.data);
      } catch (error) {
        console.error('Error al cargar detalle del modelo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModel();
  }, [slug]);

  const gallery = useMemo(() => {
    if (!model) return [];
    return [
      model.mainImageUrl ? { url: model.mainImageUrl, alt: model.title, caption: 'Imagen principal' } : null,
      ...(model.secondaryImages || []),
    ].filter(Boolean);
  }, [model]);

  if (loading) return <div className="model-3d-detail-page"><p>Cargando ficha...</p></div>;
  if (!model) return <div className="model-3d-detail-page"><p>No se ha encontrado este modelo.</p></div>;

  return (
    <div className="model-3d-detail-page">
      <Link className="model-3d-detail-page__back" to="/3dprints-keiko/modelos">← Volver al catálogo</Link>
      <section className="model-3d-detail-card">
        <div className="model-3d-detail-card__gallery">
          {gallery.map((image) => (
            <figure key={`${image.url}-${image.caption || ''}`} className="model-3d-detail-card__image">
              <img src={image.url} alt={image.alt || model.title} />
              {(image.caption || image.alt) && <figcaption>{image.caption || image.alt}</figcaption>}
            </figure>
          ))}
        </div>
        <div className="model-3d-detail-card__content">
          <p className="model-3d-detail-card__eyebrow">{model.type} · {model.material}</p>
          <h1>{model.title}</h1>
          <p className="model-3d-detail-card__lead">{model.shortDescription || model.description}</p>

          <div className="model-3d-detail-card__specs">
            <p><strong>Tamaño:</strong> {model.sizeLabel || 'No indicado'}</p>
            <p><strong>Dimensiones:</strong> {model.dimensions || 'No indicadas'}</p>
            <p><strong>Nº de colores:</strong> {model.colorsCount ?? 0}</p>
            <p><strong>Dificultad:</strong> {model.difficulty}</p>
            <p><strong>Tiempo de impresión:</strong> {model.printTime || 'No indicado'}</p>
            <p><strong>Peso:</strong> {model.weightGrams ? `${model.weightGrams} g` : 'No indicado'}</p>
          </div>

          {!!model.tags?.length && (
            <div className="model-3d-detail-card__tags">
              {model.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          )}

          {model.description && (
            <div className="model-3d-detail-card__section">
              <h2>Descripción</h2>
              <p>{model.description}</p>
            </div>
          )}

          {model.notes && (
            <div className="model-3d-detail-card__section">
              <h2>Notas</h2>
              <p>{model.notes}</p>
            </div>
          )}

          <div className="model-3d-detail-card__actions">
            {model.makerworldUrl && <a href={model.makerworldUrl} target="_blank" rel="noreferrer">Ver en MakerWorld</a>}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Model3DDetailPage;
