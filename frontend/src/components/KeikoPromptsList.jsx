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
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc'); // o 'asc'

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
    .filter(p => !filterAccess || p.access === filterAccess)
    .sort((a, b) => {
      if (sortField === 'createdAt') {
        return sortOrder === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        const valA = a[sortField]?.toLowerCase?.() || '';
        const valB = b[sortField]?.toLowerCase?.() || '';
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
    });
  const handleCopyAndOpen = (promptText, platform) => {
    navigator.clipboard.writeText(promptText);

    const urls = {
      chatgpt: 'https://chat.openai.com/',
      leonardo: 'https://app.leonardo.ai/',
      pixai: 'https://pixai.art/',
      midjourney: 'https://discord.com/invite/midjourney'
    };

    const url = urls[platform.toLowerCase()];
    if (url) window.open(url, '_blank');
    else alert('Plataforma no reconocida');
  };
  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
    // podrías mostrar un toast aquí si quieres
  };

  if (!pack) return <p>Cargando pack…</p>;

  return (
    <div className="keiko-user-container">
      <h1 className="pack-title">{pack.title}</h1>
      <p className="pack-desc">{pack.description}</p>

      <div className="filters-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar título o prompt"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        
        <div className="selectors-bar">
          <div>
            <label>Ordenar por:</label>
            <select value={sortField} onChange={e => setSortField(e.target.value)}>
              <option value="scene">Título</option>
              <option value="platform">Plataforma</option>
              <option value="createdAt">Fecha</option>
            </select>
          </div>

          <div>
            <label>Orden:</label>
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>

          <div>
            <label>Plataforma:</label>
            <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
              <option value="">Todas</option>
              {platforms.map(pl => (
                <option key={pl} value={pl}>{pl}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Access:</label>
            <select value={filterAccess} onChange={e => setFilterAccess(e.target.value)}>
              <option value="">Todos</option>
              {accesses.map(ac => (
                <option key={ac} value={ac}>{ac}</option>
              ))}
            </select>
          </div>
          <div className="reset-wrapper">
          <button className="reset-btn" onClick={() => {
            setSearch('');
            setFilterPlatform('');
            setFilterAccess('');
            setSortField('createdAt');
            setSortOrder('desc');
          }}>
            🔄 Limpiar filtros
          </button>
        </div>
        </div>
      </div>



      

      <div className="prompts-list-rows">
        {displayed.length === 0 && (
          <p className="no-results">No hay prompts que coincidan.</p>
        )}
        {displayed.map(p => (
          <div key={p._id} className="prompt-row">
            <div className="row-header">
              <h2 className="prompt-scene">{p.scene}</h2>
              <div className="prompt-actions">
                <button className="copy-btn" onClick={() => copyToClipboard(p.prompt)}>📋 Copiar</button>
                <button className="open-btn" onClick={() => handleCopyAndOpen(p.prompt, p.platform)}>🚀 Copiar y Abrir IA</button>
              </div>
            </div>
            
            <pre className="prompt-box">
              {p.prompt}
            </pre>
            <div className="row-meta">
              <span className="chip">{p.platform}</span>
              <span className="chip">{p.access}</span>
              <span className="chip">{new Date(p.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
