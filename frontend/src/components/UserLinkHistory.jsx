import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import '../styles/UserLinkHistory.css';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const UserLinkHistory = () => {
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ riskLevel: '', threatType: '', desde: '', hasta: '' });

  const fetchRecords = useCallback(async () => {
    try {
      const params = { ...filters };
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/pro/link-analysis`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params
      });
      setFiltered(res.data);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    }
  }, [filters]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const exportCSV = () => {
    const header = ['Fecha', 'Enlace', 'Resultado', 'Riesgo IA', 'Tipo IA'];
    const rows = filtered.map(r => [
      format(new Date(r.fecha), 'yyyy-MM-dd HH:mm'),
      r.urlOriginal,
      r.resultado,
      r.aiAnalysis?.riskLevel || '-',
      r.aiAnalysis?.threatType || '-'
    ]);
    const csv = [header, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'historial_links.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const borrarTodos = async () => {
    if (!window.confirm('¿Seguro que deseas borrar todos los registros mostrados?')) return;
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/pro/link-analysis/delete-bulk`, {
        ids: filtered.map(r => r._id)
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('✅ Registros eliminados correctamente.');
      fetchRecords();
    } catch (err) {
      console.error('Error al borrar registros:', err);
      alert('❌ Error al borrar los registros.');
    }
  };

  const handleResumen = resumen => {
    alert(resumen || 'Sin resumen IA disponible');
  };

  return (
    <div className="user-pro-container">
      <h2>📊 Historial de enlaces analizados (PRO)</h2>

      <div className="filtros">
        <select onChange={e => setFilters(f => ({ ...f, riskLevel: e.target.value }))} value={filters.riskLevel}>
          <option value="">Todos los riesgos</option>
          <option value="alto">❌ Alto</option>
          <option value="medio">⚠️ Medio</option>
          <option value="bajo">✅ Bajo</option>
        </select>
        <input type="text" placeholder="Tipo de amenaza..." value={filters.threatType}
               onChange={e => setFilters(f => ({ ...f, threatType: e.target.value }))} />
        <input type="date" value={filters.desde}
               onChange={e => setFilters(f => ({ ...f, desde: e.target.value }))} />
        <input type="date" value={filters.hasta}
               onChange={e => setFilters(f => ({ ...f, hasta: e.target.value }))} />
        <button onClick={fetchRecords}>Aplicar filtros</button>
        <button onClick={exportCSV}>📄 Exportar CSV</button>
        <button onClick={borrarTodos} className="danger">🗑️ Borrar todos</button>
      </div>

      <table className="user-pro-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Enlace</th>
            <th>Resultado</th>
            <th>Riesgo IA</th>
            <th>Tipo IA</th>
            <th>Resumen IA</th>
            <th>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(reg => (
            <tr key={reg._id}>
              <td>{format(new Date(reg.fecha), 'yyyy-MM-dd HH:mm')}</td>
              <td className="url-raw">{reg.urlOriginal}</td>
              <td>{reg.resultado}</td>
              <td>{reg.aiAnalysis?.riskLevel || '-'}</td>
              <td>{reg.aiAnalysis?.threatType || '-'}</td>
              <td>
                {reg.aiAnalysis?.summary
                  ? <button onClick={() => handleResumen(reg.aiAnalysis.summary)}>Ver</button>
                  : '-'}
              </td>
              <td>
                <Link to={`/pro/link-analysis/${reg._id}`}>🔍 Ver</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserLinkHistory;
