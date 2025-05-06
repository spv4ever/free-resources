
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
      {Object.keys(groupedStats).sort((a, b) => b - a).map(year => (
        <div key={year} className="stats-year">
          <h3>{year}</h3>
          {Object.entries(groupedStats[year]).map(([rocket, stats]) => (
            <div key={rocket} className="stats-rocket">
              <p><strong>{rocket}</strong></p>
              <p>✅ Éxitos: {stats.success}</p>
              <p>❌ Fallos: {stats.failure}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SpacexStats;
