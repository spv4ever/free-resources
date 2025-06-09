import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/KeikoPromptPacksFiltered.css';

const KeikoPromptPacks = () => {
  const [packs, setPacks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [accessFilter, setAccessFilter] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/prompt-packs`)
      .then(res => {
        setPacks(res.data);
        setFiltered(res.data);
      })
      .catch(err => console.error('Error cargando packs:', err));
  }, []);

  useEffect(() => {
    const lower = (str) => str?.toLowerCase() || '';
    const filteredResults = packs.filter(p =>
      lower(p.title).includes(searchTerm.toLowerCase()) &&
      (platformFilter ? p.platform === platformFilter : true) &&
      (categoryFilter ? p.category === categoryFilter : true) &&
      (accessFilter ? p.access === accessFilter : true)
    );
    setFiltered(filteredResults);
  }, [searchTerm, platformFilter, categoryFilter, accessFilter, packs]);

  const unique = (key) => [...new Set(packs.map(p => p[key]).filter(Boolean))];

  return (
    <div className="keiko-packs-wrapper">
      <h2>🎨 Explora los Packs de Prompts</h2>

      <div className="keiko-packs-header">
        <div className="keiko-search-bar">
          <input
            type="text"
            placeholder="🔍 Buscar packs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="keiko-filters">
          <select className="keiko-filter-select" value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
            <option value="">Todas las plataformas</option>
            {unique('platform').map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select className="keiko-filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">Todas las categorías</option>
            {unique('category').map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="keiko-filter-select" value={accessFilter} onChange={e => setAccessFilter(e.target.value)}>
            <option value="">Todo acceso</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
          </select>
        </div>
      </div>

      <div className="keiko-packs-grid">
        {filtered.map(pack => (
          <div key={pack._id} className="keiko-pack-card">
            <div className="keiko-pack-content">
                <h3>{pack.title}</h3>
                <p><strong>Plataforma:</strong> {pack.platform}</p>
                <p><strong>Categoría:</strong> {pack.category}</p>
                <p><strong>Acceso:</strong> {pack.access}</p>
                {pack.description && <p>{pack.description}</p>}
            </div>
            <div className="keiko-pack-footer">
                <button
                className="btn-accent"
                onClick={() => navigate(`/keikoprompts/${pack._id}`)}
                >
                Ver Prompts →
                </button>
            </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default KeikoPromptPacks;
