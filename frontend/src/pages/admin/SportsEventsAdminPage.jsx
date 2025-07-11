import React from 'react';
import AdminSportsEvents from '../../components/admin/AdminSportsEvents';

const SportsEventsAdminPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Eventos Deportivos</h1>
      <AdminSportsEvents />
    </div>
  );
};

export default SportsEventsAdminPage;
