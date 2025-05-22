import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

import '../styles/SuspiciousAccessAdmin.css'; // Estilo sugerido

const SuspiciousAccessAdmin = () => {
  const [accesses, setAccesses] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [ipFilter, setIpFilter] = useState('');
  const [pathFilter, setPathFilter] = useState('');

  const exportToCSV = async () => {
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/suspicious-access`, {
        params: { ip: ipFilter, path: pathFilter, limit: 10000 }, // ⚠️ limite alto para exportar todo
        });

        const rows = res.data.results;
        if (!rows.length) {
        alert('No hay datos para exportar.');
        return;
        }

        const headers = ['Fecha', 'IP', 'Ruta', 'User-Agent'];
        const csvRows = [
        headers.join(','),
        ...rows.map(row => [
            new Date(row.timestamp).toLocaleString(),
            `"${row.ip}"`,
            `"${row.path}"`,
            `"${row.userAgent.replace(/"/g, '""')}"` // Escapar comillas dobles
        ].join(','))
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, 'accesos-sospechosos.csv');
    } catch (err) {
        console.error('Error al exportar CSV:', err);
        alert('Error al exportar datos.');
    }
    };


  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/suspicious-access`, {
        params: { page, limit, ip: ipFilter, path: pathFilter }
      });
      setAccesses(res.data.results);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Error al cargar accesos sospechosos:', err);
    }
  };

  fetchData();
}, [page, limit, ipFilter, pathFilter]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="suspicious-admin-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <h2>🔒 Accesos sospechosos</h2>
        <button onClick={exportToCSV} style={{ padding: '0.5rem 1rem', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            📥 Exportar CSV
        </button>
        </div>
      

      <div className="suspicious-filters">
        <input
          type="text"
          placeholder="Filtrar por IP"
          value={ipFilter}
          onChange={e => setIpFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filtrar por ruta"
          value={pathFilter}
          onChange={e => setPathFilter(e.target.value)}
        />
      </div>

      <table className="suspicious-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>IP</th>
            <th>Ruta</th>
            <th>User-Agent</th>
          </tr>
        </thead>
        <tbody>
          {accesses.map(access => (
            <tr key={access._id}>
              <td>{new Date(access.timestamp).toLocaleString()}</td>
              <td>{access.ip}</td>
              <td>{access.path}</td>
              <td>{access.userAgent}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-controls">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Anterior</button>
        <span>Página {page} de {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente →</button>
      </div>
    </div>
  );
};

export default SuspiciousAccessAdmin;
