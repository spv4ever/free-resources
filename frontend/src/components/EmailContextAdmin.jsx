
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/EmailContextAdmin.css';

const EmailContextAdmin = () => {
  const [contexts, setContexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [newContextVisible, setNewContextVisible] = useState(false);
  const [newContext, setNewContext] = useState({ context: '', searchTerm: '', frequency: 'daily' });

  const fetchContexts = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/email-contexts`);
      setContexts(res.data);
    } catch (err) {
      console.error('Error cargando contextos', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualImport = async (context) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/gmail/import/${context}`);
      alert(`Importación manual de "${context}" ejecutada.`);
    } catch (err) {
      alert('Error al importar manualmente.');
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/admin/email-contexts/${id}/toggle`);
      fetchContexts();
    } catch (err) {
      alert('Error al cambiar estado');
    }
  };

  const handleEditClick = (ctx) => {
    setEditRow(ctx._id);
    setEditedData({ searchTerm: ctx.searchTerm, frequency: ctx.frequency });
  };

  const handleCancelEdit = () => {
    setEditRow(null);
    setEditedData({});
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/admin/email-contexts/${id}`, editedData);
      setEditRow(null);
      setEditedData({});
      fetchContexts();
    } catch (err) {
      alert('Error al guardar cambios');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este contexto?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/email-contexts/${id}`);
      fetchContexts();
    } catch (err) {
      alert('Error al eliminar contexto');
    }
  };

  const handleAddContext = async () => {
    if (!newContext.context || !newContext.searchTerm) {
      alert('Debes completar los campos obligatorios');
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/email-contexts`, newContext);
      setNewContext({ context: '', searchTerm: '', frequency: 'daily' });
      setNewContextVisible(false);
      fetchContexts();
    } catch (err) {
      alert('Error al crear nuevo contexto');
    }
  };

  useEffect(() => {
    fetchContexts();
  }, []);

  if (loading) return <p className="email-loading">Cargando contextos...</p>;

  return (
    <div className="email-context-admin">
      <h2 className="email-title">📩 Contextos de Email Import</h2>
      <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
        <button className="import-btn" onClick={() => setNewContextVisible(true)}>
          ➕ Añadir contexto
        </button>
      </div>
      <div className="email-table-wrapper">
        <table className="email-table">
          <thead>
            <tr>
              <th>Contexto</th>
              <th>Búsqueda</th>
              <th>Frecuencia</th>
              <th>Activo</th>
              <th>Última importación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {contexts.map((ctx) => (
              <tr key={ctx._id}>
                <td>{ctx.context}</td>
                <td>
                  {editRow === ctx._id ? (
                    <textarea
                      value={editedData.searchTerm}
                      rows={4}
                      style={{ width: '100%' }}
                      onChange={(e) =>
                        setEditedData({ ...editedData, searchTerm: e.target.value })
                      }
                    />
                  ) : (
                    ctx.searchTerm
                  )}
                </td>
                <td>
                  {editRow === ctx._id ? (
                    <select
                      value={editedData.frequency}
                      onChange={(e) =>
                        setEditedData({ ...editedData, frequency: e.target.value })
                      }
                    >
                      <option value="daily">daily</option>
                      <option value="weekly">weekly</option>
                      <option value="manual">manual</option>
                    </select>
                  ) : (
                    ctx.frequency
                  )}
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={ctx.active}
                    onChange={() => handleToggle(ctx._id)}
                  />
                </td>
                <td>{ctx.lastImportedAt ? new Date(ctx.lastImportedAt).toLocaleString() : '—'}</td>
                <td>
                  {editRow === ctx._id ? (
                    <>
                      <button className="import-btn" onClick={() => handleSaveEdit(ctx._id)}>
                        ✅ Guardar
                      </button>
                      <button className="import-btn cancel" onClick={handleCancelEdit}>
                        ❌ Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="import-btn" onClick={() => handleEditClick(ctx)}>
                        ✏️ Editar
                      </button>
                      <button className="import-btn" onClick={() => handleManualImport(ctx.context)}>
                        🚀 Importar
                      </button>
                      <button className="import-btn delete" onClick={() => handleDelete(ctx._id)}>
                        🗑️
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {newContextVisible && (
              <tr>
                <td>
                  <input
                    type="text"
                    placeholder="Nuevo contexto"
                    value={newContext.context}
                    onChange={(e) => setNewContext({ ...newContext, context: e.target.value })}
                  />
                </td>
                <td>
                  <textarea
                    placeholder="Término búsqueda"
                    value={newContext.searchTerm}
                    onChange={(e) => setNewContext({ ...newContext, searchTerm: e.target.value })}
                    rows={4}
                    style={{ width: '100%' }}
                  />
                </td>
                <td>
                  <select
                    value={newContext.frequency}
                    onChange={(e) => setNewContext({ ...newContext, frequency: e.target.value })}
                  >
                    <option value="daily">daily</option>
                    <option value="weekly">weekly</option>
                    <option value="manual">manual</option>
                  </select>
                </td>
                <td colSpan="3">
                  <button className="import-btn" onClick={handleAddContext}>
                    💾 Guardar nuevo
                  </button>
                  <button className="import-btn cancel" onClick={() => setNewContextVisible(false)}>
                    ❌ Cancelar
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmailContextAdmin;
