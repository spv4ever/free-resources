// src/pages/KeikoPromptPacks.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/KeikoPromptPacks.css';
import { useNavigate } from 'react-router-dom';
import BotonBiblioteca from '../components/BotonBiblioteca';
import ScrollToTopButton from '../components/ScrollToTopButton';

export default function KeikoPromptPacks() {
  const [packs, setPacks] = useState([]);
  const [counts, setCounts] = useState({});
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // --- 1. NUEVO ESTADO PARA EL ORDEN ---
  const [sortOrder, setSortOrder] = useState('prompts-desc');

  useEffect(() => {
    async function fetchData() {
      try {
        const [packsRes, countsRes, categorySummaryRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/keiko/packs`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/keiko/prompts/count/by-pack`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/keiko/packs/categories-summary`)
        ]);

        setPacks(packsRes.data);

        const map = countsRes.data.reduce((acc, { packId, count }) => {
          acc[packId] = count;
          return acc;
        }, {});
        setCounts(map);
        
        const sortedCategories = categorySummaryRes.data.sort((a, b) => b.promptCount - a.promptCount);
        setCategoryCounts(sortedCategories);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  // --- 2. LÓGICA DE FILTRADO Y ORDENACIÓN APLICADA ---
  const displayed = packs
    .filter(p => !categoryFilter || p.category === categoryFilter)
    .filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    )
    .slice() // Creamos una copia superficial para no mutar el array original al ordenar
    .sort((a, b) => {
      switch (sortOrder) {
        case 'prompts-desc':
          return (counts[b._id] ?? 0) - (counts[a._id] ?? 0);
        case 'prompts-asc':
          return (counts[a._id] ?? 0) - (counts[b._id] ?? 0);
        case 'alpha-asc':
          return a.title.localeCompare(b.title);
        case 'alpha-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  const PromptIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
    </svg>
  );

  return (
    <div className="keiko-packs-container">
      <header className="page-header">
        <h1>Explora nuestros Packs de Prompts</h1>
        <p>Encuentra la inspiración que necesitas para tus proyectos de IA.</p>
        <BotonBiblioteca />
      </header>

      <div className="filters-container">
        {/* --- 3. NUEVO CONTENEDOR PARA AGRUPAR BÚSQUEDA Y ORDEN --- */}
        <div className="top-filter-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="sort-controls">
            <label htmlFor="sort-order">Ordenar por:</label>
            <select id="sort-order" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
              <option value="prompts-desc">Más prompts</option>
              <option value="prompts-asc">Menos prompts</option>
              <option value="alpha-asc">Alfabético (A-Z)</option>
              <option value="alpha-desc">Alfabético (Z-A)</option>
            </select>
          </div>
        </div>

        <div className="category-filters">
          <button 
            className={`category-chip ${categoryFilter === '' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('')}>
              <span className="chip-category-name">Todas las categorías</span>
          </button>
          {categoryCounts.map(cat => (
            <button
              key={cat.name}
              className={`category-chip ${categoryFilter === cat.name ? 'active' : ''}`}
              onClick={() => setCategoryFilter(categoryFilter === cat.name ? '' : cat.name)}
            >
              <span className="chip-category-name">{cat.name}</span>
              <span className="chip-prompt-count">{cat.promptCount} prompts</span>
            </button>
          ))}
        </div>
      </div>

      <main className="packs-grid">
        {displayed.map(pack => (
          <article
            key={pack._id}
            className="pack-card"
            onClick={() => navigate(`/prompts/${pack._id}`)}
            tabIndex="0"
          >
            <div className="pack-card-image-container">
              <img 
                src={pack.image || `https://via.placeholder.com/400x225/2c2c3a/ffffff?text=${encodeURIComponent(pack.category)}`} 
                alt={pack.title} 
              />
            </div>
            <div className="pack-card-content">
              <span className="pack-card-category">{pack.category}</span>
              <h3 className="pack-card-title">{pack.title}</h3>
              <p className="pack-card-description">{pack.description}</p>
              <footer className="pack-card-footer">
                <div className="pack-card-info">
                  <PromptIcon />
                  <span>{counts[pack._id] ?? 0} prompts</span>
                </div>
              </footer>
            </div>
          </article>
        ))}
      </main>
      
      {displayed.length === 0 && (
        <div className="no-results">
          <h3>No se encontraron packs</h3>
          <p>Intenta ajustar tu búsqueda o limpiar los filtros.</p>
        </div>
      )}

      <ScrollToTopButton />
    </div>
  );
}