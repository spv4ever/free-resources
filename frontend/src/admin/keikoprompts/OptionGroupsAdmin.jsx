import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/PromptAdmin.css';

const OptionGroupsAdmin = () => {
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: '', label: '', multiple: true });
  const [editGroupId, setEditGroupId] = useState(null);
  const [editGroupData, setEditGroupData] = useState({});

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/option-groups`);
      setGroups(res.data);
    } catch (err) {
      console.error('Error al cargar grupos:', err);
    }
  };

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setNewGroup({ ...newGroup, [name]: type === 'checkbox' ? checked : value });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditGroupData({ ...editGroupData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/option-groups`, newGroup);
      setNewGroup({ name: '', label: '', multiple: true });
      fetchGroups();
    } catch (err) {
      console.error('Error al crear grupo:', err);
    }
  };

  const startEditing = (group) => {
    setEditGroupId(group._id);
    setEditGroupData({ ...group });
  };

  const cancelEdit = () => {
    setEditGroupId(null);
    setEditGroupData({});
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/option-groups/${id}`, editGroupData);
      setEditGroupId(null);
      fetchGroups();
    } catch (err) {
      console.error('Error al guardar edición:', err);
    }
  };

  const deleteGroup = async (id) => {
    if (window.confirm('¿Eliminar este grupo?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/option-groups/${id}`);
        fetchGroups();
      } catch (err) {
        console.error('Error al eliminar grupo:', err);
      }
    }
  };

  return (
    <div className="keiko-admin-wrapper">
      <h2>📂 Grupos de Opciones</h2>

      <form className="keiko-admin-form" onSubmit={handleSubmit}>
        <input name="name" value={newGroup.name} onChange={handleInput} placeholder="Identificador (ej. estilo)" required />
        <input name="label" value={newGroup.label} onChange={handleInput} placeholder="Etiqueta visible (ej. Estilo)" required />
        <label>
          <input type="checkbox" name="multiple" checked={newGroup.multiple} onChange={handleInput} />
          Permitir múltiples
        </label>
        <button type="submit">➕ Crear Grupo</button>
      </form>

      <table className="keiko-admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Etiqueta</th>
            <th>Múltiple</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(group => (
            <tr key={group._id}>
              {editGroupId === group._id ? (
                <>
                  <td><input name="name" value={editGroupData.name} onChange={handleEditChange} /></td>
                  <td><input name="label" value={editGroupData.label} onChange={handleEditChange} /></td>
                  <td><input type="checkbox" name="multiple" checked={editGroupData.multiple} onChange={handleEditChange} /></td>
                  <td>
                    <button onClick={() => saveEdit(group._id)}>💾 Guardar</button>
                    <button onClick={cancelEdit}>❌ Cancelar</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{group.name}</td>
                  <td>{group.label}</td>
                  <td>{group.multiple ? '✔️' : '❌'}</td>
                  <td>
                    <button onClick={() => startEditing(group)}>✏️ Editar</button>
                    <button onClick={() => deleteGroup(group._id)}>🗑 Eliminar</button>
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

export default OptionGroupsAdmin;
