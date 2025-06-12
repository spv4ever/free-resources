import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/KeikoAdmin.css';

const PromptItemsAdmin = () => {
  const [packs, setPacks] = useState([]);
  const [selectedPackId, setSelectedPackId] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [newPrompt, setNewPrompt] = useState({ number: '', scene: '', prompt: '' });
  const [editPromptId, setEditPromptId] = useState(null);
  const [editPromptData, setEditPromptData] = useState({});

  useEffect(() => {
    fetchPacks();
  }, []);

  useEffect(() => {
    if (selectedPackId) fetchPrompts(selectedPackId);
  }, [selectedPackId]);

  const fetchPacks = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/prompt-packs`);
    setPacks(res.data);
    if (res.data.length) setSelectedPackId(res.data[0]._id);
  };

  const fetchPrompts = async (packId) => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/prompt-items/pack/${packId}`);
    setPrompts(res.data);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setNewPrompt({ ...newPrompt, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPackId) return;

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/prompt-items`, {
        ...newPrompt,
        pack: selectedPackId
      });
      setNewPrompt({ number: '', scene: '', prompt: '' });
      fetchPrompts(selectedPackId);
    } catch (err) {
      console.error('Error creando prompt', err);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditPromptData({ ...editPromptData, [name]: value });
  };

  const startEditing = (prompt) => {
    setEditPromptId(prompt._id);
    setEditPromptData({ number: prompt.number, scene: prompt.scene, prompt: prompt.prompt });
  };

  const cancelEdit = () => {
    setEditPromptId(null);
    setEditPromptData({});
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/prompt-items/${id}`, editPromptData);
      setEditPromptId(null);
      fetchPrompts(selectedPackId);
    } catch (err) {
      console.error('Error al guardar edición', err);
    }
  };

  const deletePrompt = async (id) => {
    if (window.confirm('¿Eliminar este prompt?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/prompt-items/${id}`);
        fetchPrompts(selectedPackId);
      } catch (err) {
        console.error('Error al eliminar prompt', err);
      }
    }
  };

  return (
    <div className="keiko-admin-wrapper">
      <h2>🧠 Prompts de un Pack</h2>

      <select
        className="keiko-admin-select"
        value={selectedPackId}
        onChange={e => setSelectedPackId(e.target.value)}
      >
        {packs.map(p => (
          <option key={p._id} value={p._id}>{p.title}</option>
        ))}
      </select>

      <form className="keiko-admin-form" onSubmit={handleSubmit}>
        <input name="number" value={newPrompt.number} onChange={handleInput} placeholder="Nº Prompt" required />
        <input name="scene" value={newPrompt.scene} onChange={handleInput} placeholder="Escena" />
        <input name="prompt" value={newPrompt.prompt} onChange={handleInput} placeholder="Texto del prompt" required />
        <button type="submit">➕ Añadir Prompt</button>
      </form>

      <table className="keiko-admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Escena</th>
            <th>Texto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {prompts.map(p => (
            <tr key={p._id}>
              {editPromptId === p._id ? (
                <>
                  <td><input name="number" value={editPromptData.number} onChange={handleEditChange} /></td>
                  <td><input name="scene" value={editPromptData.scene} onChange={handleEditChange} /></td>
                  <td><input name="prompt" value={editPromptData.prompt} onChange={handleEditChange} /></td>
                  <td>
                    <button onClick={() => saveEdit(p._id)}>💾 Guardar</button>
                    <button onClick={cancelEdit}>❌ Cancelar</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{p.number}</td>
                  <td>{p.scene}</td>
                  <td>{p.prompt}</td>
                  <td>
                    <button onClick={() => startEditing(p)}>✏️ Editar</button>
                    <button onClick={() => deletePrompt(p._id)}>🗑 Eliminar</button>
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

export default PromptItemsAdmin;
