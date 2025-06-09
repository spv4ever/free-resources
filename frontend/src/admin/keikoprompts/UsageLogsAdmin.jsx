// src/admin/keikoprompts/UsageLogsAdmin.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/PromptAdmin.css';

const UsageLogsAdmin = () => {
  const [userId, setUserId] = useState('');
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/prompt-usage/${userId}`);
      setLogs(res.data);
    } catch (err) {
      console.error('Error cargando logs de uso', err);
    }
  };

  return (
    <div className="keiko-admin-wrapper">
      <h2>📊 Historial de Uso</h2>

      <div className="keiko-admin-form">
        <input
          placeholder="ID del usuario"
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
        <button onClick={fetchLogs}>🔍 Ver logs</button>
      </div>

      <table className="keiko-admin-table">
        <thead>
          <tr>
            <th>Prompt</th>
            <th>Pack</th>
            <th>Plataforma</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id}>
              <td>{log.prompt?.prompt}</td>
              <td>{log.pack?.title}</td>
              <td>{log.platform}</td>
              <td>{new Date(log.usedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsageLogsAdmin;
