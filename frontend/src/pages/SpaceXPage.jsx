
import React from 'react';
import SpacexLaunches from '../components/SpacexLaunches';
import SpacexHistory from '../components/SpacexHistory';
import '../styles/SpaceXPage.css';
import SpacexStats from '../components/SpacexStats';
import '../styles/SpacexStats.css';

const SpaceXPage = () => {
  return (
    <div className="spacex-page">
      <h1 className="spacex-page-title">🚀 Sección SpaceX</h1>
      
      <div className="spacex-stats-card">
        <SpacexStats /> 
      </div>

      <div className="spacex-section">
        
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
