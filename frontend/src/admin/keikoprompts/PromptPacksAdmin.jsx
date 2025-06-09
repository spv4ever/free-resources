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

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPack({ ...newPack, [name]: type === 'checkbox' ? checked : value });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditPackData({ ...editPackData, [name]: type === 'checkbox' ? checked : value });
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

  return (
    <div className="keiko-admin-wrapper">
      <h2>📦 Packs de Prompts</h2>

      <form className="keiko-admin-form" onSubmit={handleSubmit}>
        <input name="title" value={newPack.title} onChange={handleInput} placeholder="Título" required />
        <input name="description" value={newPack.description} onChange={handleInput} placeholder="Descripción" />
        <input name="category" value={newPack.category} onChange={handleInput} placeholder="Categoría" />
        <input name="platform" value={newPack.platform} onChange={handleInput} placeholder="Plataforma" />
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
                  <td><input name="title" value={editPackData.title} onChange={handleEditChange} /></td>
                  <td><input name="description" value={editPackData.description} onChange={handleEditChange} /></td>
                  <td><input name="category" value={editPackData.category} onChange={handleEditChange} /></td>
                  <td><input name="platform" value={editPackData.platform} onChange={handleEditChange} /></td>
                  <td><input type="checkbox" name="nsfw" checked={editPackData.nsfw} onChange={handleEditChange} /></td>
                  <td>
                    <select name="access" value={editPackData.access} onChange={handleEditChange}>
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
