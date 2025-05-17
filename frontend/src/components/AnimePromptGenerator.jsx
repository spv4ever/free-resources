import React, { useState, useEffect } from 'react';
import Select from 'react-select';

import '../styles/AnimePromptGenerator.css';
import { useUser } from '../context/UserContext'; 

function isUnderage(ageStr) {
  if (!ageStr) return false; // ✅ sin edad => se permite NSFW
  const clean = ageStr.trim().toLowerCase();
  if (clean === 'desconocida' || clean === 'unknown') return false; // ✅ se permite
  const match = clean.match(/^(\d+)\s*-\s*(\d+)$/);
  if (match) return parseInt(match[1]) < 18;
  const num = parseInt(clean);
  return !isNaN(num) && num < 18; // solo bloquea si hay número válido < 18
}
// Asegúrate de que el contexto de autenticación esté configurado correctamente

const AnimePromptGenerator = () => {
  const { user } = useUser();
  const [characterId, setCharacterId] = useState('');
  const [characters, setCharacters] = useState([]);
  const [n, setN] = useState(5);
  const [nsfwOnly, setNsfwOnly] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/anime-characters/all`);
        const data = await res.json();
        setCharacters(data);
      } catch (err) {
        console.error('Error al cargar personajes:', err);
      }
    };
    fetchCharacters();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrompts([]);

    try {
      const params = new URLSearchParams({ n, flat: 'true' });
      if (characterId) params.append('characterId', characterId);
      if (nsfwOnly) params.append('nsfwOnly', 'true');

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/anime-prompts/random?${params}`);
      const text = await response.text();

      if (!response.ok) throw new Error(text || 'Error al generar los prompts');

      const lines = text.split('\n').slice(1);
      setPrompts(lines);
    } catch (err) {
      setError('No se pudieron generar los prompts. Intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'pro' && user.role !== 'admin')) {
    return (
        <div className="restricted-area">
        <h2>🔒 Acceso restringido</h2>
        <p>Esta sección está disponible solo para usuarios con nivel <strong>PRO</strong> o <strong>ADMIN</strong>.</p>
        </div>
    );
    }
    const filterOption = (option, inputValue) => {
        const { label, from } = option.data;
        return (
            label.toLowerCase().includes(inputValue.toLowerCase()) ||
            (from && from.toLowerCase().includes(inputValue.toLowerCase()))
        );
        };


  return (
    <div className="anime-generator-container">
      <h1 className="anime-generator-title">🎨 Generador de Prompts Anime</h1>

      <form className="anime-generator-form" onSubmit={handleSubmit}>
        <label>
          Cantidad de combinaciones:
          <input
            type="number"
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            min={1}
            max={20}
          />
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={nsfwOnly}
            onChange={(e) => setNsfwOnly(e.target.checked)}
          />
          Incluir contenido NSFW (si es posible)
        </label>

        <label>
            Selecciona un personaje:
            {/* <p style={{ fontSize: '0.85rem', color: '#ccc', marginTop: '0.5rem' }}>
            Mostrando {Math.min(characters.length, 50)} de {characters.length} personajes disponibles
            </p> */}
            <Select
                options={[...characters]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .slice(0, 50)
                    .map((char) => {
                    const nsfw = !isUnderage(char.age);
                    return {
                        value: char._id,
                        label: char.name,
                        image: char.image,
                        from: char.mainWork?.title || 'Desconocido',
                        age: char.age || 'Desconocida',
                        nsfw
                    };
                    })}
                onChange={(selected) => setCharacterId(selected.value)}
                getOptionValue={(e) => e.value}
                getOptionLabel={(e) => (
                    <div className="custom-option">
                    <img src={e.image} alt={e.label} className="option-img" />
                    <div className="option-details">
                        <div><strong>{e.label}</strong> ({e.age})</div>
                        <div><em>{e.from}</em></div>
                        <div
                        style={{
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            color: e.nsfw ? '#3ee85d' : '#ff4f4f'
                        }}
                        >
                        {e.nsfw ? '🔞 NSFW permitido' : '❌ NSFW no permitido'}
                        </div>
                    </div>
                    </div>
                )}
                placeholder="Buscar personaje..."
                isSearchable={true}
                filterOption={filterOption}
                styles={{
                option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? '#222' : '#121212',
                    color: state.isFocused ? '#fff' : '#e0e0e0',
                    padding: 10,
                }),
                menu: (provided) => ({
                    ...provided,
                    backgroundColor: '#121212',
                }),
                control: (provided) => ({
                    ...provided,
                    backgroundColor: '#1c1c1c',
                    borderColor: '#333',
                    color: '#fff',
                }),
                singleValue: (provided) => ({
                    ...provided,
                    color: '#fff',
                }),
                }}

                />


            </label>

        <button type="submit" className="generate-button" disabled={loading}>
          {loading ? 'Generando...' : '🔄 Generar prompts'}
        </button>
      </form>

      {error && <p className="error-msg">{error}</p>}

      {prompts.length > 0 && (
        <div className="prompt-preview">
          <h3>📝 Vista previa de prompts generados:</h3>
          <ul>
            {prompts.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>

          <button
            className="download-button"
            onClick={() => {
              const params = new URLSearchParams({ n, format: 'csv' });
              if (characterId) params.append('characterId', characterId);
              if (nsfwOnly) params.append('nsfwOnly', 'true');
              const downloadUrl = `${process.env.REACT_APP_API_URL}/api/anime-prompts/random?${params}`;
              window.open(downloadUrl, '_blank');
            }}
          >
            📥 Descargar CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default AnimePromptGenerator;
