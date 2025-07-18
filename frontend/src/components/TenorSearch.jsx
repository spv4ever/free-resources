import React, { useState, useEffect } from 'react';
import { searchGifs, getTrendingGifs, getCategories  } from '../utils/tenorAPI';
import GifCard from './GifCard';

const TenorSearch = () => {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    getTrendingGifs().then(setGifs);
  }, []);

  useEffect(() => {
    getTrendingGifs().then(setGifs);
    getCategories().then(setCategories);
    }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
        const trending = await getTrendingGifs();
        setGifs(trending);
        return;
    }
    const results = await searchGifs(query);
    setGifs(results);
    };

    const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === '') {
        const trending = await getTrendingGifs();
        setGifs(trending);
    }
    };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Explora GIFs (by Tenor)</h2>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1rem'
        }}>
        <div
            style={{
                overflow: 'hidden',
                transition: 'max-height 0.4s ease',
                maxHeight: showAllCategories ? '500px' : '60px' // ajusta según altura de fila
            }}
            >
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                paddingBottom: '0.5rem'
            }}>
                {(showAllCategories ? categories : categories.slice(0, 8)).map((cat) => (
                <button
                    key={cat.searchterm}
                    onClick={async () => {
                        setQuery(cat.searchterm);
                        const results = await searchGifs(cat.searchterm);
                        setGifs(results);
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
                        whiteSpace: 'nowrap',
                        transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1f1f1f'}
                    >
                    <img
                        src={cat.image}
                        alt={cat.name}
                        style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                    />
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
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
            type="text"
            placeholder="Buscar GIFs..."
            value={query}
            onChange={handleInputChange}
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
        </form>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
        }}>
        {gifs.map((gif) => (
            <GifCard key={gif.id} gif={gif} />
        ))}
        </div>
    </div>
  );
};

export default TenorSearch;
