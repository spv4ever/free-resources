import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import '../styles/FilamentDetailPage.css';

function FilamentDetailPage() {
  const { slug } = useParams();
  const [filament, setFilament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilament = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/filaments/slug/${slug}`);
        setFilament(response.data);
      } catch (error) {
        console.error('Error al cargar detalle de filamento:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilament();
  }, [slug]);

  if (loading) return <div className="filament-detail-page"><p>Cargando ficha...</p></div>;
  if (!filament) return <div className="filament-detail-page"><p>No se ha encontrado este filamento.</p></div>;

  return (
    <div className="filament-detail-page">
      <Link className="filament-detail-page__back" to="/3dprints-keiko/filamentos">← Volver al catálogo</Link>
      <section className="filament-detail-card">
        <div className="filament-detail-card__image">
          {filament.imageUrl ? <img src={filament.imageUrl} alt={filament.colorName} /> : <div>Sin imagen</div>}
        </div>
        <div className="filament-detail-card__content">
          <p className="filament-detail-card__eyebrow">{filament.material} · {filament.finish || 'Acabado estándar'}</p>
          <h1>{filament.brand} · {filament.name}</h1>
          <div className="filament-detail-card__color">
            {filament.colorHex && <span style={{ backgroundColor: filament.colorHex }} />}
            <strong>{filament.colorName}</strong>
            {filament.colorHex && <small>{filament.colorHex}</small>}
          </div>

          <div className="filament-detail-card__specs">
            <p><strong>Diámetro:</strong> {filament.diameter} mm</p>
            <p><strong>Peso bobina:</strong> {filament.spoolWeightKg} kg</p>
            <p><strong>Boquilla:</strong> {filament.nozzleTempMin || '-'} - {filament.nozzleTempMax || '-'} ºC</p>
            <p><strong>Cama:</strong> {filament.bedTempMin || '-'} - {filament.bedTempMax || '-'} ºC</p>
            <p><strong>Velocidad / perfil:</strong> {filament.printSpeed || 'No indicado'}</p>
          </div>

          {filament.notes && (
            <div className="filament-detail-card__notes">
              <h2>Notas</h2>
              <p>{filament.notes}</p>
            </div>
          )}

          <div className="filament-detail-card__actions">
            {filament.amazonUrl && <a href={filament.amazonUrl} target="_blank" rel="noreferrer">Comprar en Amazon</a>}
          </div>
        </div>
      </section>
    </div>
  );
}

export default FilamentDetailPage;
