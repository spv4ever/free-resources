import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/KeikoAdmin.css';

const PromptPacksAdmin = () => {
  const [packs, setPacks] = useState([]);
  const [newPack, setNewPack] = useState({
    title: '', description: '', category: '', platform: '', nsfw: false, access: 'free'
  });
  const [editPackId, setEditPackId] = useState(null);
  const [editPackData, setEditPackData] = useState({});

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/prompt-packs`);
      setPacks(res.data);
    } catch (err) {
      console.error('Error cargando packs', err);
    }
  };

  const handleInput = (e, isEdit = false) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    if (isEdit) {
      setEditPackData({ ...editPackData, [name]: fieldValue });
    } else {
      setNewPack({ ...newPack, [name]: fieldValue });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/prompt-packs`, newPack);
      setNewPack({ title: '', description: '', category: '', platform: '', nsfw: false, access: 'free' });
      fetchPacks();
    } catch (err) {
      console.error('Error creando pack', err);
    }
  };

  const startEditing = (pack) => {
    setEditPackId(pack._id);
    setEditPackData({ ...pack });
  };

  const cancelEdit = () => {
    setEditPackId(null);
    setEditPackData({});
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/prompt-packs/${id}`, editPackData);
      setEditPackId(null);
      fetchPacks();
    } catch (err) {
      console.error('Error al guardar edición', err);
    }
  };

  const deletePack = async (id) => {
    if (window.confirm('¿Eliminar este pack?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/prompt-packs/${id}`);
        fetchPacks();
      } catch (err) {
        console.error('Error al eliminar pack', err);
      }
    }
  };

  const downloadPack = async (packId) => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/keiko/export-pack/${packId}`,
        {
            headers: {
            Authorization: `Bearer ${token}`
            }
        }
        );

        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pack_${res.data[0]?.pack?.title || 'keikoprompts'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Error exportando pack', err);
    }
    };

  const downloadAllPacks = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/keiko/export-all`, {
        headers: { Authorization: `Bearer ${token}` }
        });

        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `keikoprompts_todos_los_packs.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Error exportando todos los packs:', err);
    }
    };

  const renderInputField = (name, value, isEdit = false) => (
    <input
      name={name}
      value={value}
      onChange={(e) => handleInput(e, isEdit)}
      placeholder={name.charAt(0).toUpperCase() + name.slice(1)}
    />
  );

  return (
    <div className="keiko-admin-wrapper">
      {/* <h2>📦 Packs de Prompts</h2> */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>📦 Packs de Prompts</h2>
        <button onClick={downloadAllPacks} className="btn-secondary">⬇️ Exportar TODOS</button>
        </div>
      <form className="keiko-admin-form" onSubmit={handleSubmit}>
        {['title', 'description', 'category', 'platform'].map(field =>
          renderInputField(field, newPack[field])
        )}
        <label>
          <input type="checkbox" name="nsfw" checked={newPack.nsfw} onChange={handleInput} /> NSFW
        </label>
        <select name="access" value={newPack.access} onChange={handleInput}>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </select>
        <button type="submit">➕ Crear pack</button>
      </form>

      <table className="keiko-admin-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Descripción</th>
            <th>Categoría</th>
            <th>Plataforma</th>
            <th>NSFW</th>
            <th>Acceso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {packs.map(pack => (
            <tr key={pack._id}>
              {editPackId === pack._id ? (
                <>
                  {['title', 'description', 'category', 'platform'].map(field =>
                    <td key={field}>{renderInputField(field, editPackData[field], true)}</td>
                  )}
                  <td>
                    <input type="checkbox" name="nsfw" checked={editPackData.nsfw} onChange={(e) => handleInput(e, true)} />
                  </td>
                  <td>
                    <select name="access" value={editPackData.access} onChange={(e) => handleInput(e, true)}>
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => saveEdit(pack._id)}>💾 Guardar</button>
                    <button onClick={cancelEdit}>❌ Cancelar</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{pack.title}</td>
                  <td>{pack.description}</td>
                  <td>{pack.category}</td>
                  <td>{pack.platform}</td>
                  <td>{pack.nsfw ? '✔️' : '❌'}</td>
                  <td>{pack.access}</td>
                  <td>
                    <button onClick={() => startEditing(pack)}>✏️ Editar</button>
                    <button onClick={() => deletePack(pack._id)}>🗑 Eliminar</button>
                    <button onClick={() => downloadPack(pack._id)}>⬇️ Exportar</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PromptPacksAdmin;
