import React, { useState, useEffect } from 'react';
import { searchGifs, getTrendingGifs, getCategories, getAutocomplete } from '../utils/tenorAPI';
import GifCard from './GifCard';
import { useUser } from '../context/UserContext'; // Ajusta la ruta si es distinta
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;


const TenorSearch = () => {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [history, setHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { user, token } = useUser();
  const [favoritos, setFavoritos] = useState(new Set());

    useEffect(() => {
    const cargarFavoritos = async () => {
        if (!user || !token) return;

        try {
        const res = await axios.get(`${API_URL}/api/favoritos`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const ids = res.data.map(f => String(f.gifId));
        setFavoritos(new Set(ids)); // 👈 almacenamos como Set
        } catch (err) {
        console.error('Error al cargar favoritos', err);
        }
    };

    cargarFavoritos();
    }, [user, token]);

  useEffect(() => {
    getTrendingGifs().then(setGifs);
    getCategories().then(setCategories);
    const stored = localStorage.getItem('gifSearchHistory');
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const saveSearchToHistory = (term) => {
    const key = 'gifSearchHistory';
    const prev = JSON.parse(localStorage.getItem(key)) || [];
    const updated = [term, ...prev.filter((t) => t !== term)].slice(0, 5);
    localStorage.setItem(key, JSON.stringify(updated));
    setHistory(updated);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      const trending = await getTrendingGifs();
      setGifs(trending);
      return;
    }
    const results = await searchGifs(query);
    setGifs(results);
    saveSearchToHistory(query);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      const trending = await getTrendingGifs();
      setGifs(trending);
      return;
    }

    const auto = await getAutocomplete(value);
    setSuggestions(auto.slice(0, 6));
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = async (s) => {
    setQuery(s);
    const results = await searchGifs(s);
    setGifs(results);
    saveSearchToHistory(s);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  return (
    <div style={{ position: 'relative' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Explora GIFs (by Tenor)</h2>

      {/* CATEGORÍAS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ overflow: 'hidden', transition: 'max-height 0.4s ease', maxHeight: showAllCategories ? '500px' : '60px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingBottom: '0.5rem' }}>
            {(showAllCategories ? categories : categories.slice(0, 8)).map((cat) => (
              <button
                key={cat.searchterm}
                onClick={async () => {
                  setQuery(cat.searchterm);
                  const results = await searchGifs(cat.searchterm);
                  setGifs(results);
                  saveSearchToHistory(cat.searchterm);
                  setShowSuggestions(false);
                  setSelectedIndex(-1);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem',
                  backgroundColor: '#1f1f1f',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <img src={cat.image} alt={cat.name} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                #{cat.name.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {categories.length > 8 && (
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              style={{
                background: 'none',
                border: 'none',
                color: '#00aaff',
                fontSize: '0.9rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {showAllCategories ? 'Ver menos ▲' : 'Ver más ▼'}
            </button>
          </div>
        )}
      </div>

      {/* BUSCADOR + AUTOCOMPLETE */}
      <form
        onSubmit={handleSearch}
        style={{ position: 'relative', display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}
      >
        <input
          type="text"
          placeholder="Buscar GIFs..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (!showSuggestions) return;

            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSelectedIndex((prev) => (prev + 1) % suggestions.length);
              setQuery(suggestions[(selectedIndex + 1) % suggestions.length]);
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              const newIndex = selectedIndex <= 0 ? suggestions.length - 1 : selectedIndex - 1;
              setSelectedIndex(newIndex);
              setQuery(suggestions[newIndex]);
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
              e.preventDefault();
              handleSuggestionClick(suggestions[selectedIndex]);
            }
          }}
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '1rem'
          }}
        />
        <button type="submit" style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#007bff',
          color: '#fff',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}>
          Buscar
        </button>

        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            backgroundColor: '#222',
            border: '1px solid #444',
            borderRadius: '6px',
            marginTop: '0.25rem',
            zIndex: 10
          }}>
            {suggestions.map((s, i) => (
              <div
                key={s}
                onClick={() => handleSuggestionClick(s)}
                onMouseOver={() => setSelectedIndex(i)}
                style={{
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '0.95rem',
                  backgroundColor: selectedIndex === i ? '#333' : 'transparent'
                }}
              >
                🔍 {s}
              </div>
            ))}
          </div>
        )}
      </form>

      {/* HISTORIAL */}
      {history.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '0.5rem' }}>
            Búsquedas recientes:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {history.map((term) => (
              <button
                key={term}
                onClick={async () => {
                  setQuery(term);
                  const results = await searchGifs(term);
                  setGifs(results);
                  saveSearchToHistory(term);
                  setShowSuggestions(false);
                  setSelectedIndex(-1);
                }}
                style={{
                  padding: '0.4rem 0.7rem',
                  backgroundColor: '#222',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
        {user && token && gifs.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
            <button
            onClick={() => window.location.href = '/mis-favoritos'}
            style={{
                padding: '0.4rem 0.8rem',
                backgroundColor: '#1f1f1f',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '999px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1f1f1f'}
            >
            ⭐ Ver mis favoritos ({favoritos.size})
            </button>
        </div>
        )}
      {/* RESULTADOS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        {gifs.map((gif) => (
            <GifCard
                key={gif.id}
                gif={gif}
                user={user}
                token={token}
                isFavorito={favoritos.has(String(gif.id))}
            />
            ))}
      </div>
    </div>
  );
};

export default TenorSearch;
