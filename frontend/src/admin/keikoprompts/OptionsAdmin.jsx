import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/PromptAdmin.css';

const OptionsAdmin = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState({ name: '', label: '', description: '', isNsfw: false });
  const [editOptionId, setEditOptionId] = useState(null);
  const [editOptionData, setEditOptionData] = useState({});

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) fetchOptions();
  }, [selectedGroup]);

  const fetchGroups = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/option-groups`);
    setGroups(res.data);
    if (res.data.length) setSelectedGroup(res.data[0]._id);
  };

  const fetchOptions = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/prompt-options?group=${selectedGroup}`);
    setOptions(res.data);
  };

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setNewOption({ ...newOption, [name]: type === 'checkbox' ? checked : value });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditOptionData({ ...editOptionData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/prompt-options`, {
        ...newOption,
        group: selectedGroup
      });
      setNewOption({ name: '', label: '', description: '', isNsfw: false });
      fetchOptions();
    } catch (err) {
      console.error('Error creando opción', err);
    }
  };

  const startEditing = (option) => {
    setEditOptionId(option._id);
    setEditOptionData({ ...option });
  };

  const cancelEdit = () => {
    setEditOptionId(null);
    setEditOptionData({});
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/prompt-options/${id}`, editOptionData);
      setEditOptionId(null);
      fetchOptions();
    } catch (err) {
      console.error('Error al guardar edición:', err);
    }
  };

  const deleteOption = async (id) => {
    if (window.confirm('¿Eliminar esta opción?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/prompt-options/${id}`);
        fetchOptions();
      } catch (err) {
        console.error('Error al eliminar opción:', err);
      }
    }
  };

  return (
    <div className="keiko-admin-wrapper">
      <h2>🎨 Opciones por Grupo</h2>

      <select className="keiko-admin-select" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
        {groups.map(g => (
          <option key={g._id} value={g._id}>{g.label}</option>
        ))}
      </select>

      <form className="keiko-admin-form" onSubmit={handleSubmit}>
        <input name="name" value={newOption.name} onChange={handleInput} placeholder="Nombre interno" required />
        <input name="label" value={newOption.label} onChange={handleInput} placeholder="Etiqueta visible" required />
        <input name="description" value={newOption.description} onChange={handleInput} placeholder="Descripción (opcional)" />
        <label>
          <input type="checkbox" name="isNsfw" checked={newOption.isNsfw} onChange={handleInput} />
          Solo para NSFW
        </label>
        <button type="submit">➕ Añadir Opción</button>
      </form>

      <table className="keiko-admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Etiqueta</th>
            <th>NSFW</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {options.map(opt => (
            <tr key={opt._id}>
              {editOptionId === opt._id ? (
                <>
                  <td><input name="name" value={editOptionData.name} onChange={handleEditChange} /></td>
                  <td><input name="label" value={editOptionData.label} onChange={handleEditChange} /></td>
                  <td><input type="checkbox" name="isNsfw" checked={editOptionData.isNsfw} onChange={handleEditChange} /></td>
                  <td><input name="description" value={editOptionData.description} onChange={handleEditChange} /></td>
                  <td>
                    <button onClick={() => saveEdit(opt._id)}>💾 Guardar</button>
                    <button onClick={cancelEdit}>❌ Cancelar</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{opt.name}</td>
                  <td>{opt.label}</td>
                  <td>{opt.isNsfw ? '✔️' : '❌'}</td>
                  <td>{opt.description}</td>
                  <td>
                    <button onClick={() => startEditing(opt)}>✏️ Editar</button>
                    <button onClick={() => deleteOption(opt._id)}>🗑 Eliminar</button>
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

export default OptionsAdmin;
