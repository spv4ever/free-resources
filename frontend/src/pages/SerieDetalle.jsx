import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext'; // o tu ruta

import '../styles/SerieDetalle.css';

const SerieDetalle = () => {
  const { tmdbId } = useParams();
  const [serie, setSerie] = useState(null);
  const { user } = useUser(); // user?.role === 'admin'

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/series/${tmdbId}`)
      .then(res => setSerie(res.data))
      .catch(err => console.error('Error al obtener detalles:', err));
  }, [tmdbId]);

  const agruparPorTemporada = (episodios) => {
    return episodios.reduce((acc, ep) => {
      if (!acc[ep.season]) acc[ep.season] = [];
      acc[ep.season].push(ep);
      return acc;
    }, {});
  };
    const handleUpdateSerie = async () => {
    if (!window.confirm('¿Seguro que deseas actualizar esta serie desde TMDb?')) return;

    try {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/series/${tmdbId}/update`);
        alert('✅ Serie actualizada correctamente.');
        // Recargar datos
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/series/${tmdbId}`);
        setSerie(res.data);
    } catch (err) {
        console.error('Error actualizando serie:', err);
        alert('❌ Error al actualizar la serie.');
    }
    };
  const getLogoPath = (platform) => {
    const key = platform.toLowerCase().replace(/\s/g, '-').replace('+', 'plus');
    return `/assets/platforms/${key}.svg`;
  };

  if (!serie) return <p>Cargando...</p>;

  const episodiosPorTemporada = agruparPorTemporada(serie.episodes);

  return (
    <div className="serie-detalle-wrapper">
      {/* HEADER con fondo */}
      <div className="serie-header" style={{ backgroundImage: `url(${serie.backdrop})` }}>
        <div className="serie-header-overlay">
          <div className="serie-header-content">
            <img src={serie.image} alt={serie.title} className="serie-cover" />
            <div className="serie-info-main">
              <h1>{serie.title}</h1>
              {user?.role === 'admin' && (
                <button onClick={handleUpdateSerie} className="update-serie-button">
                    🔄 Actualizar datos de la serie
                </button>
                )}
              <p className="serie-synopsis">{serie.synopsis}</p>
              <p className="serie-genres">{serie.genres.join(', ')}</p>
              <div className="serie-platforms-inline">
                <h4>📺 Disponible en:</h4>
                <div className="platform-inline-logos">
                    {serie.availability.map((item, i) => (
                    <a key={i} href={item.url} target="_blank" rel="noreferrer" title={item.platform} className="platform-inline-card">
                        <img
                        key={i}
                        src={getLogoPath(item.platform)}
                        alt={item.platform}
                        title={item.platform}
                        className="top-logo"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/platforms/unknown.svg';
                        }}
                        />
                    </a>
                    ))}
                </div>
                </div>
              <p className="serie-status">📺 Estado: {serie.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="serie-stats">
        <div>⭐ {serie.voteAverage} ({serie.voteCount} votos)</div>
        <div>🔥 Popularidad: {serie.popularity}</div>
        <div>📅 Temporadas: {serie.totalSeasons}</div>
        <div>🎬 Episodios: {serie.episodes.length}</div>
        <div>🕐 Duración media: {serie.runtimeAvg} min</div>
        <div>🎞️ IMDB: {serie.imdbId ? <a href={`https://www.imdb.com/title/${serie.imdbId}`} target="_blank" rel="noreferrer">Ver</a> : 'N/A'}</div>
      </div>

        {/* Sinopsis */}      {/* Episodios */}
      <div className="serie-episodes">
        <h3>📂 Episodios por temporada</h3>
        {Object.entries(episodiosPorTemporada).map(([season, episodios]) => (
          <div key={season} className="season-block-table">
            <h4>Temporada {season}</h4>
            <table className="episode-table">
              <thead>
                <tr>
                  <th>Ep.</th>
                  <th>Título</th>
                  <th>Fecha</th>
                  <th>Duración</th>
                </tr>
              </thead>
              <tbody>
                {episodios.map((ep, idx) => (
                  <React.Fragment key={idx}>
                    <tr>
                      <td>{ep.episode}</td>
                      <td>
                        <div className="episode-title-wrapper">
                          {ep.stillImage && (
                            <img src={ep.stillImage} alt={`Ep ${ep.episode}`} className="episode-thumb" />
                          )}
                          <div>
                            <strong>{ep.title}</strong>
                            {ep.overview && <div className="episode-overview">{ep.overview}</div>}
                          </div>
                        </div>
                      </td>
                      <td>{new Date(ep.releaseDate).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                        })}</td>
                      <td>{ep.duration} min</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            <div className="episode-mobile-list">
                {episodios.map((ep, idx) => (
                    <div key={idx} className="episode-card">
                    <div className="episode-card-header">
                        <span>Ep. {ep.episode}</span>
                        <span className="episode-card-title">{ep.title}</span>
                    </div>
                    <div className="episode-card-body">
                        {ep.overview || 'Sinopsis no disponible.'}
                    </div>
                    <div className="episode-card-meta">
                        <span>
                        {new Date(ep.releaseDate).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                        </span>
                        <span>{ep.duration} min</span>
                    </div>
                    </div>
                ))}
                </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default SerieDetalle;
