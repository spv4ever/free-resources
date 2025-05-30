import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import '../../styles/LinkAnalysisAdmin.css';

const AdminLinkAnalysis = () => {
  const [analyses, setAnalyses] = useState([]);
  const [nivel, setNivel] = useState('');
  const [resultado, setResultado] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selectedDetails, setSelectedDetails] = useState(null);

  // ✅ Usamos useCallback para evitar warning de ESLint
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/link-analysis`, {
        params: { nivel, resultado, page },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAnalyses(res.data.data);
      setPages(res.data.pages);
    } catch (err) {
      console.error('Error al cargar análisis:', err);
    }
  }, [nivel, resultado, page]);

  const handleBulkDelete = async () => {
  if (!analyses.length) return;
  if (!window.confirm(`¿Eliminar los ${analyses.length} análisis visibles? Esta acción es irreversible.`)) return;

  try {
    const token = localStorage.getItem('token');
    const ids = analyses.map(a => a._id);

    await axios.post(
      `${process.env.REACT_APP_API_URL}/api/admin/link-analysis/delete-bulk`,
      { ids },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchData(); // Recargar
  } catch (err) {
    console.error('Error al borrar análisis:', err);
    alert('❌ No se pudieron borrar los análisis.');
  }
};

const exportToCSV = () => {
  if (analyses.length === 0) return;

  const header = ['Fecha', 'URL', 'Resultado', 'Nivel', 'Usuario'];
  const rows = analyses.map((a) => [
    new Date(a.fecha).toLocaleString(),
    a.urlOriginal,
    a.resultado,
    a.nivel,
    a.usuarioId?.email || 'anónimo'
  ]);

  const csvContent =
    [header, ...rows]
      .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `analisis_enlaces_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este análisis?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/link-analysis/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchData(); // recarga tras eliminar
    } catch (err) {
      console.error('Error al eliminar análisis:', err);
    }
  };

  // ✅ Ahora ESLint está satisfecho
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="link-admin-container">
      <h2 className="link-admin-title">📊 Análisis de enlaces</h2>

      <div className="link-admin-filters">
        <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
          <option value="">Todos los niveles</option>
          <option value="1">Nivel 1</option>
          <option value="2">Nivel 2</option>
          <option value="3">Nivel 3</option>
        </select>

        <select value={resultado} onChange={(e) => setResultado(e.target.value)}>
          <option value="">Todos los resultados</option>
          <option value="seguro">✅ Seguro</option>
          <option value="sospechoso">⚠️ Sospechoso</option>
          <option value="peligroso">❌ Peligroso</option>
        </select>
      </div>
      <div className="link-admin-actions-bar">
        <button onClick={exportToCSV}>📄 Exportar CSV</button>
        <button onClick={handleBulkDelete} className="danger">🗑️ Borrar visibles</button>
      </div>
      <table className="link-admin-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>URL</th>
            <th>Resultado</th>
            <th>Nivel</th>
            <th>Usuario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {analyses.map((a) => (
            <tr key={a._id}>
              <td>{new Date(a.fecha).toLocaleString()}</td>
              <td className="link-admin-url">{a.urlOriginal}</td>
              <td className={`link-admin-${a.resultado}`}>{a.resultado}</td>
              <td>{a.nivel}</td>
              <td>{a.usuarioId?.email || 'anónimo'}</td>
              <td>
                <div className="link-admin-actions">
                  <button onClick={() => setSelectedDetails(a.detalles)}>🔍</button>
                  <button onClick={() => handleDelete(a._id)}>🗑️</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedDetails && (
        <div className="link-admin-details">
          <h3>Detalles del análisis</h3>
          <pre>{JSON.stringify(selectedDetails, null, 2)}</pre>
          <button onClick={() => setSelectedDetails(null)}>Cerrar</button>
        </div>
      )}

      <div className="link-admin-pagination">
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            className={page === i + 1 ? 'active' : ''}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminLinkAnalysis;
