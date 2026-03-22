import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Models3DPage.css';

function Models3DPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/models-3d`);
        setModels(response.data);
      } catch (error) {
        console.error('Error al cargar modelos 3D:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const filtered = useMemo(() => {
    const normalized = filter.trim().toLowerCase();
    if (!normalized) return models;

    return models.filter((model) =>
      [model.title, model.type, model.material, model.sizeLabel, model.shortDescription, ...(model.tags || [])]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }, [models, filter]);

  return (
    <div className="models-3d-page">
      <section className="models-3d-page__hero">
        <p className="models-3d-page__eyebrow">3DPrints by Keiko</p>
        <h1>🧩 Catálogo de modelos 3D</h1>
        <p>Organiza diseños con MakerWorld opcional, galería de imágenes, tamaños, colores, materiales y notas de impresión.</p>
        <input
          type="search"
          placeholder="Buscar por nombre, tipo, material, etiqueta..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
      </section>

      {loading ? <p className="models-3d-page__loading">Cargando modelos...</p> : (
        <section className="models-3d-grid">
          {filtered.map((model) => (
            <article key={model._id} className="model-3d-card">
              <div className="model-3d-card__image">
                {model.mainImageUrl ? <img src={model.mainImageUrl} alt={model.title} /> : <div>Sin imagen</div>}
              </div>
              <div className="model-3d-card__content">
                <div className="model-3d-card__badges">
                  <span>{model.type}</span>
                  <span>{model.material}</span>
                  {model.isFeatured && <span>Destacado</span>}
                </div>
                <h2>{model.title}</h2>
                <p>{model.shortDescription || 'Sin descripción corta'}</p>
                <div className="model-3d-card__meta">
                  <span><strong>Tamaño:</strong> {model.sizeLabel || model.dimensions || 'No indicado'}</span>
                  <span><strong>Colores:</strong> {model.colorsCount ?? 0}</span>
                </div>
                {!!model.tags?.length && (
                  <div className="model-3d-card__tags">
                    {model.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                )}
                <div className="model-3d-card__actions">
                  <Link to={`/3dprints-keiko/modelos/${model.slug}`}>Ver detalle</Link>
                  {model.makerworldUrl && <a href={model.makerworldUrl} target="_blank" rel="noreferrer">MakerWorld</a>}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default Models3DPage;
