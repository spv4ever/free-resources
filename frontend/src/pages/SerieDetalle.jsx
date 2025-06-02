import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';

import '../styles/SerieDetalle.css';

const SerieDetalle = () => {
  const { tmdbId } = useParams();
  const [serie, setSerie] = useState(null);
  const { user } = useUser();
  const [isFavorite, setIsFavorite] = useState(false);
  const [episodiosVistos, setEpisodiosVistos] = useState([]);
  const [serieVistaCompleta, setSerieVistaCompleta] = useState(false);
  const token = localStorage.getItem('token');

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

  // useEffect(() => {
  //   const checkFavorite = async () => {
  //     if (!user || !token || !serie?._id) return;
  //     try {
  //       const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/favorites/${serie._id}/check`, {
  //         headers: { Authorization: `Bearer ${token}` }
  //       });
  //       setIsFavorite(res.data.isFavorite);
  //     } catch (err) {
  //       console.error('Error al comprobar favoritos:', err);
  //     }
  //   };
  //   checkFavorite();
  // }, [tmdbId, user, token, serie]);

  useEffect(() => {
    const fetchEstadoFavorito = async () => {
      if (!user || !token || !serie?._id) return;
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/favorites/${serie._id}/full`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { isFavorite, seenEpisodes, markedComplete } = res.data;

        setIsFavorite(isFavorite);
        setSerieVistaCompleta(Boolean(markedComplete));

        if (Array.isArray(seenEpisodes)) {
          const vistos = seenEpisodes.map(e => `${e.seasonNumber}-${e.episodeNumber}`);
          setEpisodiosVistos(vistos);
        }
      } catch (err) {
        console.error('Error al obtener estado favorito:', err);
      }
    };

    fetchEstadoFavorito();
  }, [tmdbId, user, token, serie]);

  const handleFavoriteToggle = async () => {
    if (!serie || !token) return;
    const mongoSeriesId = serie._id;
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/user/favorites/${mongoSeriesId}`;
      if (isFavorite) {
        await axios.delete(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(url, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error actualizando favoritos:', err);
    }
  };

  const handleMarkEpisodeSeen = async (season, episode) => {
    if (!serie || !token) return;

    const key = `${season}-${episode}`;
    const visto = episodiosVistos.includes(key);

    const url = `${process.env.REACT_APP_API_URL}/api/user/favorites/${serie._id}/${visto ? 'unmark' : 'mark'}-episode`;

    try {
      await axios.post(url, {
        seasonNumber: season,
        episodeNumber: episode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEpisodiosVistos(prev =>
        visto ? prev.filter(k => k !== key) : [...prev, key]
      );
    } catch (err) {
      console.error('Error al marcar/desmarcar episodio:', err);
    }
  };


  const handleMarkSeasonSeen = async (season, episodes) => {
    const keys = episodes.map(e => `${season}-${e}`);
    const allMarked = keys.every(k => episodiosVistos.includes(k));

    try {
      if (!allMarked) {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/user/favorites/${serie._id}/mark-season/${season}`, {
          episodes
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEpisodiosVistos(prev => [...new Set([...prev, ...keys])]);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/user/favorites/${serie._id}/unmark-season/${season}`, {
          episodes
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEpisodiosVistos(prev => prev.filter(k => !keys.includes(k)));
      }
    } catch (err) {
      console.error('Error al marcar/desmarcar temporada:', err);
    }
  };
  const handleMarkSeriesComplete = async () => {
    const allKeys = serie.episodes.map(ep => `${ep.season}-${ep.episode}`);
    const allMarked = allKeys.every(k => episodiosVistos.includes(k));

    try {
      if (!allMarked) {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/user/favorites/${serie._id}/mark-complete`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEpisodiosVistos(allKeys);
        setSerieVistaCompleta(true);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/user/favorites/${serie._id}/unmark-complete`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEpisodiosVistos([]);
        setSerieVistaCompleta(false);
      }
    } catch (err) {
      console.error('Error al marcar/desmarcar serie completa:', err);
    }
  };


  if (!serie) return <p>Cargando...</p>;
  const episodiosPorTemporada = agruparPorTemporada(serie.episodes);

  return (
    <div className={`serie-detalle-wrapper${serieVistaCompleta ? ' serie-completa' : ''}`}>
      <div className="serie-header" style={{ backgroundImage: `url(${serie.backdrop})` }}>
        <div className="serie-header-overlay">
          <div className="serie-header-content">
            <img src={serie.image} alt={serie.title} className="serie-cover" />
            {token ? (
              <button className={`favorite-icon-btn ${isFavorite ? 'active' : ''}`} onClick={handleFavoriteToggle} title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}>
                {isFavorite ? '❤️' : '🤍'}
              </button>
            ) : (
              <button className="favorite-icon-btn disabled" title="Requiere registro para marcar como favorita" disabled>
                🤍
              </button>
            )}
            <div className="serie-info-main">
              <h1>{serie.title}</h1>
              {token && (
                <button className="btn-accent" onClick={handleMarkSeriesComplete}>
                    {serieVistaCompleta ? '✅ Serie completada' : '📺 Marcar serie completa'}
                  </button>
              )}
              {user?.role === 'admin' && (
                <button onClick={handleUpdateSerie} className="update-serie-button">🔄 Actualizar datos de la serie</button>
              )}
              <p className="serie-synopsis">{serie.synopsis}</p>
              <p className="serie-genres">{serie.genres.join(', ')}</p>
              <div className="serie-platforms-inline">
                <h4>📺 Disponible en:</h4>
                <div className="platform-inline-logos">
                  {serie.availability.map((item, i) => (
                    <a key={i} href={item.url} target="_blank" rel="noreferrer" title={item.platform} className="platform-inline-card">
                      <img src={getLogoPath(item.platform)} alt={item.platform} title={item.platform} className="top-logo" onError={(e) => { e.target.onerror = null; e.target.src = '/assets/platforms/unknown.svg'; }} />
                    </a>
                  ))}
                </div>
              </div>
              <p className="serie-status">📺 Estado: {serie.status}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="serie-stats">
        <div>⭐ {serie.voteAverage} ({serie.voteCount} votos)</div>
        <div>🔥 Popularidad: {serie.popularity}</div>
        <div>📅 Temporadas: {serie.totalSeasons}</div>
        <div>🎬 Episodios: {serie.episodes.length}</div>
        <div>🕐 Duración media: {serie.runtimeAvg} min</div>
        <div>🎞️ IMDB: {serie.imdbId ? <a href={`https://www.imdb.com/title/${serie.imdbId}`} target="_blank" rel="noreferrer">Ver</a> : 'N/A'}</div>
      </div>

      <div className="serie-episodes">
        <h3>📂 Episodios por temporada</h3>
        {Object.entries(episodiosPorTemporada).map(([season, episodios]) => {
          const keys = episodios.map(e => `${season}-${e.episode}`);
          const todosVistos = keys.every(k => episodiosVistos.includes(k));

          return (
            <div key={season} className="season-block-table">
              <h4>Temporada {season}</h4>
              {token && (
                <button
                  className="btn-accent"
                  onClick={() => handleMarkSeasonSeen(season, episodios.map(e => e.episode))}
                  style={{ marginBottom: '0.5rem' }}
                >
                  {todosVistos ? '✅ Temporada vista' : '📂 Marcar temporada completa'}
                </button>
              )}
              <table className="episode-table">
                <thead>
                  <tr>
                    <th>Ep.</th>
                    <th>Título</th>
                    <th>Fecha</th>
                    <th>Duración</th>
                    <th>Visto</th>
                  </tr>
                </thead>
                <tbody>
                  {episodios.map((ep, idx) => {
                    const key = `${season}-${ep.episode}`;
                    const visto = episodiosVistos.includes(key);
                    return (
                      <tr key={idx} className={visto ? 'episodio-visto' : ''}>
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
                        <td>{new Date(ep.releaseDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                        <td>{ep.duration} min</td>
                        <td>
                          {token && (
                            <button
                              className="episodio-btn"
                              onClick={() => handleMarkEpisodeSeen(season, ep.episode)}
                              title="Marcar como visto"
                            >
                              {visto ? '✅' : '👁'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SerieDetalle;
