// src/components/admin/KeikoPromptsAdmin.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './KeikoPromptsAdmin.css';

function exportToCSV(data, filename = 'prompts_export.csv') {
  const csvRows = [];

  // Cabecera
  const headers = ['Título del Prompt', 'Texto del Prompt', 'Platform', 'Access', 'Título del Pack', 'Categoría del Pack'];
  csvRows.push(headers.join(','));

  // Contenido
  for (const item of data) {
    const row = [
      `"${item.scene}"`,
      `"${item.prompt.replace(/"/g, '""')}"`,
      item.platform,
      item.access,
      `"${item.packTitle}"`,
      `"${item.packCategory}"`
    ];
    csvRows.push(row.join(','));
  }

  // UTF-8 BOM para Excel
  const csvContent = '\uFEFF' + csvRows.join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}



export default function KeikoPromptsAdmin() {
  const [packs, setPacks] = useState([]);
  const [selectedPack, setSelectedPack] = useState('');
  const [prompts, setPrompts] = useState([]);

  // filtros
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterAccess, setFilterAccess] = useState('');

  // modal
  const [showModal, setShowModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);

  const emptyForm = {
    packId: '',
    scene: '',
    prompt: '',
    platform: '',
    access: 'free',
    fixedOptions: {}
  };
  const [form, setForm] = useState(emptyForm);

  // cargar packs
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/keiko/packs`)
      .then(({ data }) => setPacks(data))
      .catch(console.error);
  }, []);

  // cargar prompts y reset filtros al cambiar de pack
  useEffect(() => {
    setFilterPlatform('');
    setFilterAccess('');
    if (!selectedPack) {
      setPrompts([]);
      return;
    }
    axios.get(`${process.env.REACT_APP_API_URL}/api/keiko/prompts/by-pack/${selectedPack}`)
      .then(({ data }) => setPrompts(data))
      .catch(console.error);
  }, [selectedPack]);

  // opciones de filtro únicas
  const platforms = Array.from(new Set(prompts.map(p => p.platform))).sort();
  const accesses = ['free', 'pro'];

  // aplicar filtros
  const displayed = prompts
    .filter(p => !filterPlatform || p.platform === filterPlatform)
    .filter(p => !filterAccess   || p.access   === filterAccess);

  // modal
  const openModal = p => {
    if (p) {
      setEditingPrompt(p._id);
      setForm({ ...p });
    } else {
      setEditingPrompt(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  // save/create
  const handleSave = async () => {
    try {
      if (editingPrompt) {
        const { data: up } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/keiko/prompts/${editingPrompt}`,
          form
        );
        setPrompts(prompts.map(p => p._id === editingPrompt ? up : p));
      } else {
        const { data: cr } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/keiko/prompts`,
          form
        );
        setPrompts([cr, ...prompts]);
      }
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  // delete
  const handleDelete = async id => {
    if (!window.confirm('¿Eliminar este prompt?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/keiko/prompts/${id}`);
      setPrompts(prompts.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };
  const exportPrompts = () => {
    if (!selectedPack) {
      alert('Selecciona un pack primero.');
      return;
    }

    const selectedPackObj = packs.find(p => p._id === selectedPack);
    const enrichedData = displayed.map(p => ({
      ...p,
      packTitle: selectedPackObj?.title || '',
      packCategory: selectedPackObj?.category || ''
    }));

    exportToCSV(enrichedData);
  };
  return (
    <div className="keiko-admin-container">
      <h1>📋 Keiko Prompts</h1>
      <div className="keiko-nav-buttons">
        <button onClick={() => window.location.href = '/admin/keiko-packs'}>
          🧩 Ir a Packs
        </button>
        <button onClick={() => window.location.href = '/admin/imports'}>
          ⬆️ Importar Prompts
        </button>
        <button onClick={() => exportPrompts()}>
          📤 Exportar Seleccionados
        </button>
      </div>

      <div className="filters-bar">
        <select value={selectedPack} onChange={e => setSelectedPack(e.target.value)}>
          <option value="">— Seleccionar Pack —</option>
          {packs.map(p => (
            <option key={p._id} value={p._id}>{p.title}</option>
          ))}
        </select>

        <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
          <option value="">Platform: Todas</option>
          {platforms.map(pl => (
            <option key={pl} value={pl}>{pl}</option>
          ))}
        </select>

        <select value={filterAccess} onChange={e => setFilterAccess(e.target.value)}>
          <option value="">Access: Todos</option>
          {accesses.map(ac => (
            <option key={ac} value={ac}>{ac}</option>
          ))}
        </select>

        <button className="keiko-admin-add-btn" onClick={() => openModal(null)}>
          ➕ Nuevo Prompt
        </button>
      </div>

      <table className="keiko-admin-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Prompt</th>
            <th className="center-col">Platform</th>
            <th className="center-col">Access</th>
            <th className="center-col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {displayed.map(p => (
            <tr key={p._id}>
              <td>{p.scene}</td>
              <td className="prompt-cell">{p.prompt}</td>
              <td className="center-col">{p.platform}</td>
              <td className="center-col">{p.access}</td>
              <td className="center-col">
                <button onClick={() => openModal(p)}>✏️</button>
                <button onClick={() => handleDelete(p._id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal prompt-modal">
            <h2>{editingPrompt ? 'Editar Prompt' : 'Nuevo Prompt'}</h2>

            <div className="form-row">
              <label>Pack:</label>
              <select
                value={form.packId}
                onChange={e => setForm({ ...form, packId: e.target.value })}
              >
                <option value="">—</option>
                {packs.map(p => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label>Título:</label>
              <input
                type="text"
                value={form.scene}
                onChange={e => setForm({ ...form, scene: e.target.value })}
              />
            </div>

            <div className="form-row">
              <label>Prompt:</label>
              <textarea
                value={form.prompt}
                rows="10"
                onChange={e => setForm({ ...form, prompt: e.target.value })}
              />
            </div>

            <div className="form-row">
              <label>Platform:</label>
              <input
                type="text"
                value={form.platform}
                onChange={e => setForm({ ...form, platform: e.target.value })}
              />
            </div>

            <div className="form-row">
              <label>Access:</label>
              <select
                value={form.access}
                onChange={e => setForm({ ...form, access: e.target.value })}
              >
                <option value="free">free</option>
                <option value="pro">pro</option>
              </select>
            </div>

            <div className="modal-actions">
              <button onClick={handleSave}>💾 Guardar</button>
              <button onClick={closeModal} className="cancel-btn">✖️ Cancelar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
