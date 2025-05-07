
import React, { useEffect, useState } from 'react';

const SpacexStats = () => {
  const [groupedStats, setGroupedStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/spacex/stats`);
        const data = await response.json();

        const grouped = {};
        data.forEach(({ _id, count }) => {
          const { year, rocket, status } = _id;
          if (!grouped[year]) grouped[year] = {};
          if (!grouped[year][rocket]) grouped[year][rocket] = { success: 0, failure: 0 };

          if (status.toLowerCase().includes('success')) {
            grouped[year][rocket].success += count;
          } else {
            grouped[year][rocket].failure += count;
          }
        });

        setGroupedStats(grouped);
      } catch (err) {
        console.error('Error cargando estadísticas:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="spacex-stats">
      <h2>📊 Estadísticas Generales</h2>
      <div className="stats-header">
        <span>Año</span>
        <span>Cohete</span>
        <span>✅ Éxitos</span>
        <span>❌ Fallos</span>
      </div>
      {Object.keys(groupedStats).sort((a, b) => b - a).map(year =>
        Object.entries(groupedStats[year]).map(([rocket, stats], i) => (
          <div key={year + rocket} className="stats-row">
            <span>{i === 0 ? year : ''}</span>
            <span>{rocket}</span>
            <span>{stats.success}</span>
            <span>{stats.failure}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default SpacexStats;
