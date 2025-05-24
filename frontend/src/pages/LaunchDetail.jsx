import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/LaunchDetail.css';
import LaunchTimeline from '../components/LaunchTimeline';

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
    spacecraft,
    launch_service_provider,
    upcoming,
    last_updated,
    mission_patches,
    vidURLs,
    updates,
  } = launch;
  const mainVideo = launch.webcastManualEmbed || launch.highlightedVideo || vidURLs?.[0]?.url || webcast;


  return (
    <div className="launch-detail">
      <h1>{name}</h1>

      {/* Imagen principal */}
      {image && (
        <img src={image} alt={`Lanzamiento ${name}`} className="launch-image" />
      )}

      {/* Parche de misión */}
      {mission_patches?.length > 0 && (
        <img
          src={mission_patches[0].image_url}
          alt="Misión Patch"
          className="mission-patch"
        />
      )}

      {/* Video embebido o link */}
      {mainVideo?.includes('youtube.com') || mainVideo?.includes('youtu.be') ? (
          <iframe
            width="100%"
            height="400"
            src={mainVideo.replace('watch?v=', 'embed/')}
            title="Video del lanzamiento"
            allowFullScreen
          ></iframe>
        ) : mainVideo?.includes('x.com') || mainVideo?.includes('twitter.com') ? (
          <div className="twitter-video-box">
            <p>🎥 Video oficial en X:</p>
            <a
              href={mainVideo}
              target="_blank"
              rel="noreferrer"
              className="twitter-link-button"
            >
              Ver en X (Twitter)
            </a>
          </div>
        ) : (
          <a
            href={mainVideo}
            target="_blank"
            rel="noreferrer"
            className="video-link"
          >
            Ver video del lanzamiento
          </a>
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
          {pad.map_url && (
            <a href={pad.map_url} target="_blank" rel="noreferrer">Ver en mapa</a>
          )}
        </section>
      )}

      {launch_service_provider && (
        <section>
          <h2>🏢 Proveedor del lanzamiento</h2>
          <p><strong>Nombre:</strong> {launch_service_provider.name}</p>
          <p><strong>País:</strong> {launch_service_provider.country_code}</p>
        </section>
      )}

      {/* Timeline del vuelo */}
      {/* {launch.timeline && launch.timeline.length > 0 && (
        <section className="timeline-section">
          <h2>🕒 Cronología del lanzamiento</h2>
          <ul className="timeline-list">
            {launch.timeline.map((event, i) => (
              <li key={i}>
                <strong>{formatRelativeTime(event.relative_time)}</strong>: <em>{event.type?.abbrev}</em> – {event.type?.description}
              </li>
            ))}
          </ul>
        </section>
      )} */}
      {launch.timeline?.length > 0 && (
        <section>
          <h2>🕒 Cronología del Lanzamiento</h2>
          <LaunchTimeline timeline={launch.timeline} isPast={!launch.upcoming} />
        </section>
      )}

      {/* Actualizaciones estilo Twitter */}
      {updates?.length > 0 && (
        <section>
          <h2>📢 Actualizaciones</h2>
          <ul className="updates">
            {updates.map((u, i) => (
              <li key={i}>
                <img src={u.profile_image} alt="user" className="profile-img" />
                <div>
                  <p><strong>{u.created_by}</strong> — {new Date(u.created_on).toLocaleString()}</p>
                  <p>{u.comment}</p>
                  {u.info_url && (
                    <a href={u.info_url} target="_blank" rel="noreferrer">Fuente</a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default LaunchDetail;
