import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/LaunchDetail.css';

const LaunchDetail = () => {
  const { id } = useParams();
  const [launch, setLaunch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLaunch = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/spacex/launch/${id}`);
        setLaunch(res.data);
      } catch (err) {
        console.error('Error al cargar lanzamiento:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLaunch();
  }, [id]);

  if (loading) return <p>Cargando detalles del lanzamiento...</p>;
  if (!launch) return <p>Lanzamiento no encontrado.</p>;

  const {
    name,
    net,
    image,
    webcast,
    status,
    pad,
    rocket,
    mission,
    launch_service_provider,
    spacecraft,
    upcoming,
    last_updated
  } = launch;

  return (
    <div className="launch-detail">
      <h1>{name}</h1>

      {image && (
        <img src={image} alt={`Patch del lanzamiento ${name}`} className="mission-patch" />
      )}

      <section>
        <h2>🗓 Información básica</h2>
        <p><strong>Fecha (UTC):</strong> {new Date(net).toUTCString()}</p>
        <p><strong>Estado:</strong> {status?.name}</p>
        <p><strong>¿Próximo?:</strong> {upcoming ? 'Sí' : 'No'}</p>
        <p><strong>Última actualización:</strong> {new Date(last_updated).toLocaleString()}</p>
      </section>

      {rocket && (
        <section>
          <h2>🚀 Cohete</h2>
          <p><strong>Nombre:</strong> {rocket.configuration?.full_name}</p>
          <p><strong>Fabricante:</strong> {rocket.configuration?.manufacturer?.name}</p>
        </section>
      )}

      {mission && (
        <section>
          <h2>🎯 Misión</h2>
          <p><strong>Nombre:</strong> {mission.name}</p>
          <p><strong>Tipo:</strong> {mission.type}</p>
          <p><strong>Órbita:</strong> {mission.orbit?.name}</p>
          <p><strong>Descripción:</strong> {mission.description}</p>
        </section>
      )}

      {spacecraft && (
        <section>
          <h2>🛰 Carga útil</h2>
          <p><strong>Nombre:</strong> {spacecraft.name}</p>
          <p><strong>Fabricante:</strong> {spacecraft.manufacturer?.name}</p>
        </section>
      )}

      {pad && (
        <section>
          <h2>📍 Plataforma de lanzamiento</h2>
          <p><strong>Nombre:</strong> {pad.name}</p>
          <p><strong>Ubicación:</strong> {pad.location?.name} ({pad.location?.country_code})</p>
          <p><strong>Coordenadas:</strong> {pad.latitude}, {pad.longitude}</p>
        </section>
      )}

      {launch_service_provider && (
        <section>
          <h2>🏢 Proveedor del lanzamiento</h2>
          <p><strong>Nombre:</strong> {launch_service_provider.name}</p>
          <p><strong>País:</strong> {launch_service_provider.country_code}</p>
        </section>
      )}

      {webcast && (
        <section className="video-section">
          <h2>🎥 Webcast</h2>
          <a href={webcast} target="_blank" rel="noreferrer">Ver video del lanzamiento</a>
        </section>
      )}
    </div>
  );
};

export default LaunchDetail;
