import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/KeikoPromptPacks.css';
import { useNavigate } from 'react-router-dom';

export default function KeikoPromptPacks() {
  const [packs, setPacks] = useState([]);
  const [counts, setCounts] = useState({});
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const [packsRes, countsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/keiko/packs`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/keiko/prompts/count/by-pack`)
      ]);
      setPacks(packsRes.data);
      // convertir a { packId: count }
      const map = countsRes.data.reduce((acc, { packId, count }) => {
        acc[packId] = count;
        return acc;
      }, {});
      setCounts(map);
    }
    fetchData();
  }, []);

  // categorías únicas para selector
  const categories = Array.from(new Set(packs.map(p => p.category))).sort();

  // packs filtrados
  const displayed = packs
    .filter(p => !categoryFilter || p.category === categoryFilter)
    .filter(p => 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="keiko-packs-container">
      <div className="filters-bar">
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">— Todas las categorías —</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Buscar en título o descripción"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="packs-grid">
        {displayed.map(pack => (
          <div key={pack._id} className="pack-card">
            <h3>{pack.title}</h3>
            <p className="description">{pack.description}</p>
            <div className="info">
              <span>{counts[pack._id] ?? 0} prompts</span>
              <button
                onClick={() => navigate(`/prompts/${pack._id}`)}
              >
                Ver prompts →
              </button>
            </div>
          </div>
        ))}
        {displayed.length === 0 && (
          <p className="no-results">No se encontraron packs</p>
        )}
      </div>
    </div>
  );
}
