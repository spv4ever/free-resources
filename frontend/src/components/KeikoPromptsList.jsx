// src/components/KeikoPromptsList.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/KeikoPromptsList.css';
import { useParams } from 'react-router-dom';

export default function KeikoPromptsList() {
  const { packId } = useParams();
  const [pack, setPack] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterAccess, setFilterAccess] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/keiko/packs/${packId}`)
      .then(({ data }) => setPack(data))
      .catch(console.error);

    axios.get(`${process.env.REACT_APP_API_URL}/api/keiko/prompts/by-pack/${packId}`)
      .then(({ data }) => setPrompts(data))
      .catch(console.error);
  }, [packId]);

  const platforms = Array.from(new Set(prompts.map(p => p.platform))).sort();
  const accesses = ['free', 'pro'];

  const displayed = prompts
    .filter(p =>
      p.scene.toLowerCase().includes(search.toLowerCase()) ||
      p.prompt.toLowerCase().includes(search.toLowerCase())
    )
    .filter(p => !filterPlatform || p.platform === filterPlatform)
    .filter(p => !filterAccess   || p.access   === filterAccess);

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
    // podrías mostrar un toast aquí si quieres
  };

  if (!pack) return <p>Cargando pack…</p>;

  return (
    <div className="keiko-user-container">
      <h1 className="pack-title">{pack.title}</h1>
      <p className="pack-desc">{pack.description}</p>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Buscar título o prompt"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={filterPlatform}
          onChange={e => setFilterPlatform(e.target.value)}
        >
          <option value="">Platform: Todas</option>
          {platforms.map(pl => (
            <option key={pl} value={pl}>{pl}</option>
          ))}
        </select>

        <select
          value={filterAccess}
          onChange={e => setFilterAccess(e.target.value)}
        >
          <option value="">Access: Todos</option>
          {accesses.map(ac => (
            <option key={ac} value={ac}>{ac}</option>
          ))}
        </select>
      </div>

      <div className="prompts-list-rows">
        {displayed.length === 0 && (
          <p className="no-results">No hay prompts que coincidan.</p>
        )}
        {displayed.map(p => (
          <div key={p._id} className="prompt-row">
            <div className="row-header">
              <h2 className="prompt-scene">{p.scene}</h2>
              <button
                className="copy-btn"
                onClick={() => copyToClipboard(p.prompt)}
              >
                📋 Copiar
              </button>
            </div>
            <pre className="prompt-box">
              {p.prompt}
            </pre>
            <div className="row-meta">
              <span className="chip">{p.platform}</span>
              <span className="chip">{p.access}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
