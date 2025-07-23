import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './KeikoPromptsAdmin.css';

function exportToCSV(data, filename = 'prompts_export.csv') {
  const csvRows = [];
  const headers = ['Título del Prompt', 'Texto del Prompt', 'Platform', 'Access', 'Título del Pack', 'Categoría del Pack', 'Estilo', 'Temática'];
  csvRows.push(headers.join(','));

  for (const item of data) {
    const row = [
      `"${item.scene}"`,
      `"${item.prompt.replace(/"/g, '""')}"`,
      item.platform,
      item.access,
      `"${item.packTitle}"`,
      `"${item.packCategory}"`,
      item.fixedOptions?.estilo?.map(e => e.label).join(' / ') || '',
      item.fixedOptions?.["temática"]?.map(t => t.label).join(' / ') || ''
    ];
    csvRows.push(row.join(','));
  }

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

  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterAccess, setFilterAccess] = useState('');
  const [filterEstilo, setFilterEstilo] = useState('');
  const [filterTematica, setFilterTematica] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [massPlatform, setMassPlatform] = useState('');

  const emptyForm = {
    packId: '',
    scene: '',
    prompt: '',
    platform: '',
    access: 'free',
    fixedOptions: {}
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/keiko/packs`)
      .then(({ data }) => setPacks(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setFilterPlatform('');
    setFilterAccess('');
    setFilterEstilo('');
    setFilterTematica('');
    setSelectedIds([]);
    if (!selectedPack) {
      setPrompts([]);
      return;
    }
    axios.get(`${process.env.REACT_APP_API_URL}/api/keiko/prompts/by-pack/${selectedPack}`)
      .then(({ data }) => setPrompts(data))
      .catch(console.error);
  }, [selectedPack]);

  const getUniqueValuesFromFixedOptions = (key) =>
    Array.from(new Set(
      prompts.flatMap(p => p.fixedOptions?.[key]?.map(opt => opt.label) || [])
    )).sort();

  const platforms = Array.from(new Set(prompts.map(p => p.platform))).sort();
  const accesses = ['free', 'pro'];
  const estilos = getUniqueValuesFromFixedOptions('estilo');
  const tematicas = getUniqueValuesFromFixedOptions('temática');

  const displayed = prompts
    .filter(p => !filterPlatform || p.platform === filterPlatform)
    .filter(p => !filterAccess || p.access === filterAccess)
    .filter(p =>
      !filterEstilo ||
      (p.fixedOptions?.estilo?.some(opt => opt.label === filterEstilo))
    )
    .filter(p =>
      !filterTematica ||
      (p.fixedOptions?.["temática"]?.some(opt => opt.label === filterTematica))
    );

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

  const handleDelete = async id => {
    if (!window.confirm('¿Eliminar este prompt?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/keiko/prompts/${id}`);
      setPrompts(prompts.filter(p => p._id !== id));
      setSelectedIds(selectedIds.filter(sel => sel !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMassUpdatePlatform = async () => {
    if (!massPlatform || selectedIds.length === 0) return;
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/keiko/prompts/mass-update`, {
        ids: selectedIds,
        platform: massPlatform
      });
      const updated = prompts.map(p =>
        selectedIds.includes(p._id) ? { ...p, platform: massPlatform } : p
      );
      setPrompts(updated);
      setSelectedIds([]);
      setMassPlatform('');
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

  const toggleAll = e => {
    const checked = e.target.checked;
    setSelectedIds(checked ? displayed.map(p => p._id) : []);
  };

  const isAllSelected = selectedIds.length === displayed.length && displayed.length > 0;

  const getGroupLabels = (key) =>
  Array.from(new Set(
    prompts.flatMap(p => p.fixedOptions?.[key]?.map(opt => opt.label) || [])
  )).sort();

  const allEstilos = getGroupLabels('estilo');
  const allTematicas = getGroupLabels('temática');

  const updateFixedOptions = (key, values) => {
    const groupName = key;
    const updated = {
      ...form.fixedOptions,
      [groupName]: values.map(label => ({
        name: label.toLowerCase().replace(/\s+/g, '-'),
        label,
        group: {
          name: groupName,
          label: groupName.charAt(0).toUpperCase() + groupName.slice(1),
          multiple: true
        }
      }))
    };
    setForm({ ...form, fixedOptions: updated });
  };


  return (
    <div className="keiko-admin-container">
      <h1>📋 Keiko Prompts</h1>
      <div className="keiko-nav-buttons">
        <button onClick={() => window.location.href = '/admin/keiko-packs'}>🧩 Ir a Packs</button>
        <button onClick={() => window.location.href = '/admin/imports'}>⬆️ Importar Prompts</button>
        <button onClick={exportPrompts}>📤 Exportar Seleccionados</button>
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

        <select value={filterEstilo} onChange={e => setFilterEstilo(e.target.value)}>
          <option value="">Estilo: Todos</option>
          {estilos.map(est => (
            <option key={est} value={est}>{est}</option>
          ))}
        </select>

        <select value={filterTematica} onChange={e => setFilterTematica(e.target.value)}>
          <option value="">Temática: Todas</option>
          {tematicas.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <button className="keiko-admin-add-btn" onClick={() => openModal(null)}>➕ Nuevo Prompt</button>
      </div>

      {selectedIds.length > 0 && (
        <div className="mass-edit-bar">
          <span>{selectedIds.length} seleccionados</span>
          <input
            type="text"
            placeholder="Nuevo Platform"
            value={massPlatform}
            onChange={e => setMassPlatform(e.target.value)}
          />
          <button onClick={handleMassUpdatePlatform}>✏️ Actualizar Platform</button>
        </div>
      )}

      <table className="keiko-admin-table">
        <thead>
          <tr>
            <th><input type="checkbox" onChange={toggleAll} checked={isAllSelected} /></th>
            <th>Título</th>
            <th>Prompt</th>
            <th className="center-col">Platform</th>
            <th className="center-col">Access</th>
            <th className="center-col">Estilo</th>
            <th className="center-col">Temática</th>
            <th className="center-col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {displayed.map(p => (
            <tr key={p._id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(p._id)}
                  onChange={e => {
                    const checked = e.target.checked;
                    setSelectedIds(checked
                      ? [...selectedIds, p._id]
                      : selectedIds.filter(id => id !== p._id)
                    );
                  }}
                />
              </td>
              <td>{p.scene}</td>
              <td className="prompt-cell">{p.prompt}</td>
              <td className="center-col">{p.platform}</td>
              <td className="center-col">{p.access}</td>
              <td className="center-col">{(p.fixedOptions?.estilo || []).map(e => e.label).join(', ')}</td>
              <td className="center-col">{(p.fixedOptions?.["temática"] || []).map(t => t.label).join(', ')}</td>
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

            <div className="form-row">
            <label>Estilo:</label>
            <select
              multiple
              value={form.fixedOptions?.estilo?.map(e => e.label) || []}
              onChange={e =>
                updateFixedOptions('estilo', Array.from(e.target.selectedOptions).map(opt => opt.value))
              }
            >
              {allEstilos.map(est => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Temática:</label>
            <select
              multiple
              value={form.fixedOptions?.["temática"]?.map(t => t.label) || []}
              onChange={e =>
                updateFixedOptions('temática', Array.from(e.target.selectedOptions).map(opt => opt.value))
              }
            >
              {allTematicas.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
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
