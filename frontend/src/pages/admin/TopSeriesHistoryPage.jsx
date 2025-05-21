import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/TopSeriesHistoryPage.css';

const TopSeriesHistoryPage = () => {
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/series/weeks`)
      .then(res => {
        setWeeks(res.data);
        if (res.data.length) setSelectedWeek(res.data[0]);
      })
      .catch(err => console.error('Error cargando semanas:', err));
  }, []);

  useEffect(() => {
    if (!selectedWeek) return;
    axios.get(`${process.env.REACT_APP_API_URL}/api/series/top-weekly?week=${selectedWeek}`)
      .then(res => setRanking(res.data.top))
      .catch(err => {
        console.error('Error cargando ranking:', err);
        setRanking([]);
      });
  }, [selectedWeek]);
  const handleUpdateSerie = async (tmdbId) => {
    if (!window.confirm('¿Deseas actualizar esta serie desde TMDb?')) return;

    try {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/series/${tmdbId}/update`);
        alert('✅ Serie actualizada correctamente.');
        // Opcional: recargar lista
    } catch (err) {
        console.error('Error al actualizar la serie:', err);
        alert('❌ Error al actualizar la serie.');
    }
    };
  const getLogoPath = (platform) => {
    const key = platform.toLowerCase().replace(/\s/g, '-').replace('+', 'plus');
    return `/assets/platforms/${key}.svg`;
  };

  return (
    <div className="admin-page">
      <h2>📅 Historial Top Semanal de Series</h2>

      <div className="week-selector">
        <label>Seleccionar semana:</label>
        <select value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)}>
          {weeks.map((week, idx) => (
            <option key={idx} value={week}>{week}</option>
          ))}
        </select>
      </div>

      <div className="weekly-top-gallery">
        {ranking.map((serie, index) => (
          <div key={serie.tmdbId} className="top-series-item">
            <span className="top-rank">#{index + 1}</span>
            <img src={serie.image} alt={serie.title} className="top-poster" />
            <h4 className="top-title">{serie.title}</h4>
            <div className="top-platforms">
              {(serie.availability || []).map((p, i) => (
                <img
                  key={i}
                  src={getLogoPath(p.platform)}
                  alt={p.platform}
                  title={p.platform}
                  className="top-logo"
                />
              ))}
              <button
                onClick={() => handleUpdateSerie(serie.tmdbId)}
                className="update-serie-button"
                >
                🔄 Actualizar
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSeriesHistoryPage;
