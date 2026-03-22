import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/FilamentsPage.css';

function FilamentsPage() {
  const [filaments, setFilaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchFilaments = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/filaments`);
        setFilaments(response.data);
      } catch (error) {
        console.error('Error al cargar filamentos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilaments();
  }, []);

  const filtered = useMemo(() => {
    const normalized = filter.trim().toLowerCase();
    if (!normalized) return filaments;
    return filaments.filter((filament) =>
      [filament.brand, filament.name, filament.material, filament.colorName, filament.finish]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }, [filaments, filter]);

  const uniqueBrands = useMemo(
    () => new Set(filaments.map((filament) => filament.brand).filter(Boolean)).size,
    [filaments]
  );

  const uniqueMaterials = useMemo(
    () => new Set(filaments.map((filament) => filament.material).filter(Boolean)).size,
    [filaments]
  );

  return (
    <div className="filaments-page">
      <section className="filaments-page__hero">
        <div className="filaments-page__hero-copy">
          <p className="filaments-page__eyebrow">3DPrints by Keiko</p>
          <h1>Catálogo de filamentos</h1>
          <p className="filaments-page__intro">
            Encuentra rápidamente materiales, tonos y rangos de impresión con una vista más limpia y pensada para comparar.
          </p>

          <div className="filaments-page__search-wrap">
            <span className="filaments-page__search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Buscar por marca, material, color o acabado..."
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Buscar filamentos"
            />
          </div>
        </div>

        <div className="filaments-page__hero-panel">
          <div className="filaments-page__stat">
            <span className="filaments-page__stat-value">{filaments.length}</span>
            <span className="filaments-page__stat-label">referencias</span>
          </div>
          <div className="filaments-page__stat">
            <span className="filaments-page__stat-value">{uniqueBrands}</span>
            <span className="filaments-page__stat-label">marcas</span>
          </div>
          <div className="filaments-page__stat">
            <span className="filaments-page__stat-value">{uniqueMaterials}</span>
            <span className="filaments-page__stat-label">materiales</span>
          </div>
          <p className="filaments-page__hero-note">
            {filter ? `${filtered.length} resultado(s) para “${filter}”.` : 'Usa el buscador para filtrar sin perder contexto visual.'}
          </p>
        </div>
      </section>

      {loading ? (
        <p className="filaments-page__loading">Cargando filamentos...</p>
      ) : (
        <>
          <section className="filaments-page__toolbar" aria-label="Resumen del catálogo">
            <p className="filaments-page__results">
              Mostrando <strong>{filtered.length}</strong> de <strong>{filaments.length}</strong> filamentos.
            </p>
            {filter && (
              <button type="button" className="filaments-page__clear" onClick={() => setFilter('')}>
                Limpiar búsqueda
              </button>
            )}
          </section>

          <section className="filaments-grid">
            {filtered.map((filament) => (
              <article key={filament._id} className="filament-card">
                <div className="filament-card__image">
                  {filament.imageUrl ? (
                    <img src={filament.imageUrl} alt={`${filament.brand} ${filament.colorName}`} />
                  ) : (
                    <div className="filament-card__placeholder">Sin imagen</div>
                  )}
                  <div className="filament-card__overlay">
                    <span className="filament-card__material">{filament.material || 'Material no indicado'}</span>
                    {filament.colorHex && (
                      <span
                        className="filament-card__swatch"
                        style={{ backgroundColor: filament.colorHex }}
                        aria-label={`Muestra del color ${filament.colorName}`}
                      />
                    )}
                  </div>
                </div>

                <div className="filament-card__content">
                  <div className="filament-card__heading">
                    <p className="filament-card__brand">{filament.brand}</p>
                    <h2>{filament.name}</h2>
                  </div>

                  <dl className="filament-card__specs">
                    <div>
                      <dt>Color</dt>
                      <dd>{filament.colorName || 'No indicado'}</dd>
                    </div>
                    <div>
                      <dt>Acabado</dt>
                      <dd>{filament.finish || 'No indicado'}</dd>
                    </div>
                    <div>
                      <dt>Boquilla</dt>
                      <dd>{filament.nozzleTempMin || '-'} / {filament.nozzleTempMax || '-'} ºC</dd>
                    </div>
                  </dl>

                  <div className="filament-card__actions">
                    <Link to={`/3dprints-keiko/filamentos/${filament.slug}`}>Ver detalle</Link>
                    {filament.amazonUrl && (
                      <a href={filament.amazonUrl} target="_blank" rel="noreferrer">
                        Comprar
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>

          {!filtered.length && (
            <div className="filaments-page__empty">
              <h2>No hay coincidencias</h2>
              <p>Prueba con otra marca, un material distinto o un nombre de color más general.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FilamentsPage;
