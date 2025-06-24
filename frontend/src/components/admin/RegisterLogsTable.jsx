// src/components/admin/RegisterLogsTable.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/RegisterLogsTable.css';
import { useUser } from '../../context/UserContext';

const RegisterLogsTable = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useUser();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/register-logs`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setLogs(res.data);
      } catch (err) {
        console.error('❌ Error al cargar logs:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin' && token) {
      fetchLogs();
    }
      }, [user, token]);

  if (!user || user.role !== 'admin') {
    return <p>Acceso denegado</p>;
  }

  return (
    <div className="register-logs-container">
      <h2>📋 Intentos de Registro</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : logs.length === 0 ? (
        <p>No hay registros recientes.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Nickname</th>
              <th>Resultado</th>
              <th>Motivo</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i}>
                <td>{log.email}</td>
                <td>{log.nickname}</td>
                <td style={{ color: log.success ? 'green' : 'red' }}>
                  {log.success ? '✔️ Éxito' : '❌ Fallo'}
                </td>
                <td>{log.reason || '-'}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RegisterLogsTable;
