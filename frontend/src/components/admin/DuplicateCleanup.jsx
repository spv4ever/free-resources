// src/components/admin/DuplicateCleanup.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './DuplicateCleanup.css';

export default function DuplicateCleanup() {
  const [phase, setPhase] = useState('idle');
  const [packs, setPacks] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [details, setDetails] = useState({});
  const [selected, setSelected] = useState({});
  const [deleteAll, setDeleteAll] = useState(false);
  const [modal, setModal] = useState({ open: false, text: '' });
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const API = process.env.REACT_APP_API_URL;

  const handleDetect = async () => {
    setPhase('scanning');
    setResult('');
    setError('');
    try {
      const res = await axios.get(`${API}/api/keiko/duplicates`);
      setPacks(res.data);
      const init = {};
      res.data.forEach(p => { init[p.packId] = p.duplicates > 0; });
      setSelected(init);
      setPhase('ready');
    } catch {
      setError('Error al detectar duplicados');
      setPhase('idle');
    }
  };

  const toggleExpand = async packId => {
    setExpanded(e => ({ ...e, [packId]: !e[packId] }));
    if (!details[packId]) {
      const res = await axios.get(`${API}/api/keiko/duplicates/${packId}/details`);
      setDetails(d => ({ ...d, [packId]: res.data }));
    }
  };

  const togglePack = id => setSelected(s => ({ ...s, [id]: !s[id] }));

  const handleDelete = async () => {
    const toDelete = packs.filter(p => selected[p.packId]).map(p => p.packId);
    if (!toDelete.length) return;
    setModal({ open: true, text: 'Eliminando duplicados…' });
    try {
      const res = await axios.post(
        `${API}/api/keiko/duplicates/delete`,
        { packIds: toDelete, deleteAll }
      );
      setResult(`Eliminados ${res.data.deletedCount} prompts duplicados.`);
      await handleDetect();
    } catch {
      setError('Error al eliminar duplicados');
      setPhase('ready');
    } finally {
      setTimeout(() => setModal({ open: false, text: '' }), 500);
    }
  };

  return (
    <div className="dup-cleanup">
      <h2>Limpiar Prompts Duplicados</h2>
      {error && <p className="error">{error}</p>}
      <div className="controls-top">
        <button className="button-primary" onClick={handleDetect}>
          Detectar duplicados
        </button>
        {phase === 'ready' && (
          <button
            className="button-secondary"
            onClick={handleDelete}
            disabled={!packs.some(p => selected[p.packId])}
          >
            Eliminar duplicados
          </button>
        )}
      </div>

      {phase === 'ready' && (
        <>
          <label className="delete-all-toggle">
            <input
              type="checkbox"
              checked={deleteAll}
              onChange={() => setDeleteAll(d => !d)}
            /> Borrar <strong>todos</strong> los duplicados (sin conservar uno)
          </label>

          <table className="dup-table">
            <thead>
              <tr>
                <th>✔︎</th><th>Pack</th><th>Duplicados</th>
              </tr>
            </thead>
            <tbody>
              {packs.map(p => (
                <React.Fragment key={p.packId}>
                  <tr onClick={() => toggleExpand(p.packId)}>
                    <td>
                      <input
                        type="checkbox"
                        checked={!!selected[p.packId]}
                        onClick={e => { e.stopPropagation(); togglePack(p.packId); }}
                      />
                    </td>
                    <td>{p.title}</td>
                    <td>{p.duplicates}</td>
                  </tr>
                  {expanded[p.packId] && details[p.packId] && (
                    <tr className="details-row">
                      <td colSpan={3}>
                        <table className="inner-table">
                          <thead>
                            <tr><th>Scene</th><th>Prompt</th></tr>
                          </thead>
                          <tbody>
                            {details[p.packId].map(doc => (
                              <tr key={doc._id}>
                                <td>{doc.scene}</td>
                                <td>{doc.prompt}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </>
      )}

      {modal.open && (
        <div className="modal">
          <div className="modal-content">
            <div className="spinner" />
            <p>{modal.text}</p>
          </div>
        </div>
      )}

      {result && <p className="success">{result}</p>}
    </div>
  );
}
