import React from 'react';
import SyncWeeklyTopButton from '../../components/SyncWeeklyTopButton';

const TopSeriesSyncPage = () => {
  return (
    <div className="admin-page">
      <h2>🔄 Sincronizar Top Semanal de Series</h2>
      <p>Pulsa el botón para descargar y guardar el ranking de series más populares de esta semana desde TMDb.</p>
      <SyncWeeklyTopButton />
    </div>
  );
};

export default TopSeriesSyncPage;
