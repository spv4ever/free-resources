// src/components/KeikoPromptPacksAdmin.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/KeikoPromptPacksAdmin.css';

const KeikoPromptPacksAdmin = () => {
  const [packs, setPacks] = useState([]);
  const [filteredPacks, setFilteredPacks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [newPackMode, setNewPackMode] = useState(false);
  const [editedPack, setEditedPack] = useState({ title: '', category: '', description: '' });
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleteType, setDeleteType] = useState(''); // 'success' | 'error'

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Obtener packs
        const { data: packsData } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/keiko/packs`
        );

        // 2) Obtener conteos
        const { data: countData } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/keiko/prompts/count/by-pack`
        );
        const countMap = countData.reduce((acc, { packId, count }) => {
          acc[packId] = count;
          return acc;
        }, {});

        // 3) Enriquecer packs y recopilar categorías
        const cats = new Set();
        const enriched = packsData.map(p => {
          cats.add(p.category);
          return {
            ...p,
            totalPrompts: countMap[p._id] ?? 0
          };
        });

        setPacks(enriched);
        setCategories([...cats].sort());
        setFilteredPacks(enriched);
      } catch (err) {
        console.error('Error cargando datos:', err);
      }
    };

    fetchData();
  }, []);

  // Aplicar filtros y búsqueda
  useEffect(() => {
    let temp = [...packs];
    if (filterCategory) {
      temp = temp.filter(p => p.category === filterCategory);
    }
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      temp = temp.filter(p =>
        p.title.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower)
      );
    }
    setFilteredPacks(temp);
  }, [packs, filterCategory, searchTerm]);

  const handleDelete = async id => {
    if (!window.confirm('¿Seguro de eliminar este pack y todos sus prompts?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/keiko/packs/${id}`);
      setPacks(packs.filter(p => p._id !== id));
      setDeleteMessage('✅ Pack eliminado correctamente');
      setDeleteType('success');
    } catch (err) {
      console.error(err);
      setDeleteMessage('❌ Error al eliminar pack');
      setDeleteType('error');
    }
    setTimeout(() => setDeleteMessage(''), 3000);
  };

  const handleEditClick = pack => {
    setEditingId(pack._id);
    setNewPackMode(false);
    setEditedPack({
      title: pack.title,
      category: pack.category,
      description: pack.description
    });
  };

  const handleSaveClick = async id => {
    try {
      const { data: updated } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/keiko/packs/${id}`,
        editedPack
      );
      setPacks(packs.map(p =>
        p._id === id ? { ...updated, totalPrompts: p.totalPrompts } : p
      ));
      setEditingId(null);
    } catch (err) {
      console.error('Error al guardar cambios:', err);
    }
  };

  const handleAddNewClick = () => {
    setNewPackMode(true);
    setEditingId(null);
    setEditedPack({ title: '', category: '', description: '' });
  };

  const handleAddNewSave = async () => {
    if (!editedPack.title.trim()) return;
    try {
      const { data: newPack } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/keiko/packs`,
        editedPack
      );
      setPacks([{ ...newPack, totalPrompts: 0 }, ...packs]);
      setEditedPack({ title: '', category: '', description: '' });
      setNewPackMode(false);
    } catch (err) {
      console.error('Error al crear pack:', err);
    }
  };

  const handleAddNewCancel = () => {
    setNewPackMode(false);
    setEditedPack({ title: '', category: '', description: '' });
  };

  return (
    <div className="kpks-container">
      <h1>📦 KeikoPrompt Packs</h1>
      <div className="kpks-nav-buttons">
        <button onClick={() => window.location.href = '/admin/keiko-prompts'}>
          📋 Ir a Prompts
        </button>
        <button onClick={() => window.location.href = '/admin/imports'}>
          ⬆️ Importar Prompts
        </button>
      </div>

      {deleteMessage && (
        <div className={`kpks-notification ${deleteType}`}>
          {deleteMessage}
        </div>
      )}

      <div className="kpks-filters">
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">— Todas las categorías —</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <input
          type="text"
          placeholder="Buscar en título o descripción…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <button className="kpks-add-btn" onClick={handleAddNewClick}>
          ➕ Añadir nuevo pack
        </button>
      </div>

      <table className="kpks-table">
        <colgroup>
          <col style={{ width: '20%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '45%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Título</th>
            <th>Categoría</th>
            <th>Descripción</th>
            <th># Prompts</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {newPackMode && (
            <tr>
              <td>
                <input
                  placeholder="Título"
                  value={editedPack.title}
                  onChange={e => setEditedPack({ ...editedPack, title: e.target.value })}
                />
              </td>
              <td>
                <input
                  placeholder="Categoría"
                  value={editedPack.category}
                  onChange={e => setEditedPack({ ...editedPack, category: e.target.value })}
                />
              </td>
              <td>
                <input
                  placeholder="Descripción"
                  value={editedPack.description}
                  onChange={e => setEditedPack({ ...editedPack, description: e.target.value })}
                />
              </td>
              <td>—</td>
              <td>
                <button onClick={handleAddNewSave}>💾</button>
                <button
                  className="kpks-cancel-btn"
                  onClick={handleAddNewCancel}
                  style={{ marginLeft: '8px' }}
                >
                  ✖️
                </button>
              </td>
            </tr>
          )}

          {filteredPacks.map(pack => (
            <tr key={pack._id}>
              {editingId === pack._id ? (
                <>
                  <td>
                    <input
                      value={editedPack.title}
                      onChange={e => setEditedPack({ ...editedPack, title: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={editedPack.category}
                      onChange={e => setEditedPack({ ...editedPack, category: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={editedPack.description}
                      onChange={e => setEditedPack({ ...editedPack, description: e.target.value })}
                    />
                  </td>
                  <td>{pack.totalPrompts}</td>
                  <td>
                    <button onClick={() => handleSaveClick(pack._id)}>💾 Guardar</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{pack.title}</td>
                  <td>{pack.category}</td>
                  <td>{pack.description}</td>
                  <td>{pack.totalPrompts}</td>
                  <td>
                    <button onClick={() => handleEditClick(pack)}>✏️</button>
                    <button style={{ marginLeft: 8 }} onClick={() => handleDelete(pack._id)}>
                      🗑️
                    </button>
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

export default KeikoPromptPacksAdmin;
