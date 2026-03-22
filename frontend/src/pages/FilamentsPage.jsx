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

  return (
    <div className="filaments-page">
      <section className="filaments-page__hero">
        <p className="filaments-page__eyebrow">3DPrints by Keiko</p>
        <h1>🧵 Catálogo de filamentos</h1>
        <p>Consulta rápidamente marcas, colores, materiales, temperaturas y acceso directo a compra.</p>
        <input
          type="search"
          placeholder="Buscar por marca, material, color..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
      </section>

      {loading ? <p className="filaments-page__loading">Cargando filamentos...</p> : (
        <section className="filaments-grid">
          {filtered.map((filament) => (
            <article key={filament._id} className="filament-card">
              <div className="filament-card__image">
                {filament.imageUrl ? <img src={filament.imageUrl} alt={`${filament.brand} ${filament.colorName}`} /> : <div>Sin imagen</div>}
              </div>
              <div className="filament-card__content">
                <div className="filament-card__swatch-row">
                  <span className="filament-card__material">{filament.material}</span>
                  {filament.colorHex && <span className="filament-card__swatch" style={{ backgroundColor: filament.colorHex }} />}
                </div>
                <h2>{filament.brand}</h2>
                <h3>{filament.name}</h3>
                <p><strong>Color:</strong> {filament.colorName}</p>
                <p><strong>Acabado:</strong> {filament.finish || 'No indicado'}</p>
                <p><strong>Boquilla:</strong> {filament.nozzleTempMin || '-'} / {filament.nozzleTempMax || '-'} ºC</p>
                <div className="filament-card__actions">
                  <Link to={`/3dprints-keiko/filamentos/${filament.slug}`}>Ver detalle</Link>
                  {filament.amazonUrl && <a href={filament.amazonUrl} target="_blank" rel="noreferrer">Comprar en Amazon</a>}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default FilamentsPage;
