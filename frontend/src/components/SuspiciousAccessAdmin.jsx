import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import '../styles/SuspiciousAccessAdmin.css';

const SuspiciousAccessAdmin = () => {
  const [view, setView] = useState('suspicious');
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [ipFilter, setIpFilter] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const url =
        view === 'suspicious'
          ? '/api/admin/suspicious-access'
          : '/api/admin/rate-limit-blocks';

      const res = await axios.get(`${process.env.REACT_APP_API_URL}${url}`, {
        params: { page, limit, ip: ipFilter }
      });

      setData(res.data.results);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Error al cargar registros:', err);
    }
  }, [view, page, limit, ipFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="suspicious-admin-container">
      <h2>🛡️ Administración de accesos</h2>

      <div className="suspicious-tabs">
        <button onClick={() => setView('suspicious')} className={view === 'suspicious' ? 'active' : ''}>
          🔍 Sospechosos
        </button>
        <button onClick={() => setView('rate-limit')} className={view === 'rate-limit' ? 'active' : ''}>
          ⏳ Bloqueos 429
        </button>
      </div>

      <div className="suspicious-filters">
        <input
          type="text"
          placeholder="Filtrar por IP"
          value={ipFilter}
          onChange={e => setIpFilter(e.target.value)}
        />
      </div>

      <table className="suspicious-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>IP</th>
            <th>Ruta</th>
            {view === 'suspicious' && <th>User-Agent</th>}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row._id}>
              <td>{new Date(row.timestamp).toLocaleString()}</td>
              <td>{row.ip}</td>
              <td>{row.path}</td>
              {view === 'suspicious' && <td>{row.userAgent}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-controls">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
          ← Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
          Siguiente →
        </button>
      </div>
    </div>
  );
};

export default SuspiciousAccessAdmin;
