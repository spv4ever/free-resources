
import React from 'react';
import SpacexLaunches from '../components/SpacexLaunches';
import SpacexHistory from '../components/SpacexHistory';
import '../styles/SpaceXPage.css';

const SpaceXPage = () => {
  return (
    <div className="spacex-page">
      <h1 className="spacex-page-title">🚀 Sección SpaceX</h1>
      
      <div className="spacex-stats-card">
        <h2>📊 Estadísticas Generales</h2>
        <p>(Próximamente: lanzamientos exitosos y fallidos por año y tipo de cohete)</p>
      </div>

      <div className="spacex-section">
        <h2>🚀 Próximos Lanzamientos</h2>
        <SpacexLaunches />
      </div>

      <div className="spacex-section">
        <h2>🕓 Historial de Lanzamientos</h2>
        <SpacexHistory />
      </div>
    </div>
  );
};

export default SpaceXPage;
