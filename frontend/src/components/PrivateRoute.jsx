import React from 'react';
import { useUser } from '../context/UserContext';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) return <p>Cargando sesión...</p>; // o un spinner

  if (!user) return <Navigate to="/login" />;

  return children;
}

export default PrivateRoute;
