import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import '../styles/AnimePromptOptionsAdmin.css';

const TABS = [
  { key: 'styles', label: '🎨 Estilos' },
  { key: 'angles', label: '📸 Ángulos' },
  { key: 'outfits', label: '👗 Ropa' },
  { key: 'locations', label: '📍 Ubicaciones' },
  { key: 'poses', label: '🧍‍♀️ Poses' },
  { key: 'tags', label: '🏷️ Etiquetas' }
];

const AnimePromptOptionsAdmin = () => {
  const [activeTab, setActiveTab] = useState('styles');
  const [data, setData] = useState({});
  const [editRow, setEditRow] = useState(null); // id de edición
  const [editData, setEditData] = useState({});
  const [newRowData, setNewRowData] = useState(null);
  const [loading, setLoading] = useState(false);

  const API = `${process.env.REACT_APP_API_URL}/api/anime-prompt-data`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = {};
      for (const tab of TABS) {
        const res = await axios.get(`${API}/${tab.key}`);
        result[tab.key] = res.data;
      }
      setData(result);
    } catch (err) {
      console.error('Error cargando opciones:', err);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const startEdit = (id, row) => {
    setEditRow(id);
    setEditData(row);
  };

  const cancelEdit = () => {
    setEditRow(null);
    setEditData({});
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`${API}/${activeTab}/${id}`, editData);
      cancelEdit();
      fetchData();
    } catch (err) {
      console.error('Error al guardar cambios:', err);
    }
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/${activeTab}/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error al borrar:', err);
    }
  };

  const addNewRow = () => {
    const first = data[activeTab]?.[0];
    if (!first) return;
    const empty = {};
    Object.keys(first).forEach(k => {
      if (k !== '_id' && k !== '__v') empty[k] = '';
    });
    setNewRowData(empty);
  };

  const cancelNew = () => {
    setNewRowData(null);
  };

  const saveNew = async () => {
    try {
      await axios.post(`${API}/${activeTab}`, newRowData);
      setNewRowData(null);
      fetchData();
    } catch (err) {
      console.error('Error al crear nueva entrada:', err);
    }
  };

  const handleNewChange = (field, value) => {
    setNewRowData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const getFields = () => {
    const first = data[activeTab]?.[0] || newRowData;
    if (!first) return [];
    return Object.keys(first).filter(k => k !== '_id' && k !== '__v');
  };

  return (
    <div className="ai-admin-container">
      <h2 className="ai-admin-title">🛠️ Gestor de Opciones de Prompts Anime</h2>

      <div className="ai-admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`ai-admin-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.key);
              setEditRow(null);
              setNewRowData(null);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <div className="ai-admin-table-wrapper">
            <table className="ai-admin-table">
              <thead>
                <tr>
                  {getFields().map((field) => (
                    <th key={field}>{field}</th>
                  ))}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data[activeTab]?.map((item) => (
                  <tr key={item._id}>
                    {getFields().map((field) =>
                      editRow === item._id ? (
                        <td key={field}>
                          <input
                            type="text"
                            value={editData[field] || ''}
                            onChange={(e) => handleEditChange(field, e.target.value)}
                          />
                        </td>
                      ) : (
                        <td key={field}>{item[field]}</td>
                      )
                    )}
                    <td>
                      {editRow === item._id ? (
                        <>
                          <button onClick={() => saveEdit(item._id)}>💾</button>
                          <button onClick={cancelEdit}>❌</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(item._id, item)}>✏️</button>
                          <button onClick={() => handleDelete(item._id)}>🗑️</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}

                {newRowData && (
                  <tr>
                    {getFields().map((field) => (
                      <td key={field}>
                        <input
                          type="text"
                          placeholder={field}
                          value={newRowData[field]}
                          onChange={(e) => handleNewChange(field, e.target.value)}
                        />
                      </td>
                    ))}
                    <td>
                      <button onClick={saveNew}>💾</button>
                      <button onClick={cancelNew}>❌</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!newRowData && (
            <div className="ai-admin-form">
              <button className="ai-admin-add" onClick={addNewRow}>➕ Añadir nueva fila</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnimePromptOptionsAdmin;
