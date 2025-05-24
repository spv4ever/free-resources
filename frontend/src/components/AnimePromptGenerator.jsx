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
  const [customName, setCustomName] = useState('');
  const [customFrom, setCustomFrom] = useState('');

    const [styles, setStyles] = useState([]);
    const [views, setViews] = useState([]);
    const [outfits, setOutfits] = useState([]);
    const [locations, setLocations] = useState([]);
    const [poses, setPoses] = useState([]);
    const [tags, setTags] = useState([]);

    // Selecciones del usuario
    const [selectedStyles, setSelectedStyles] = useState([]);
    const [selectedViews, setSelectedViews] = useState([]);
    const [selectedOutfits, setSelectedOutfits] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedPoses, setSelectedPoses] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    useEffect(() => {
    const loadOptions = async () => {
        try {
        const fetchAll = async (path) => {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/anime-prompt-data/${path}`);
            return res.json();
        };
        const [s, v, o, l, p, t] = await Promise.all([
            fetchAll('styles'),
            fetchAll('angles'),
            fetchAll('outfits'),
            fetchAll('locations'),
            fetchAll('poses'),
            fetchAll('tags')
        ]);
        setStyles(s);
        setViews(v);
        setOutfits(o);
        setLocations(l);
        setPoses(p);
        setTags(t);
        } catch (err) {
        console.error('Error cargando opciones de filtro:', err);
        }
    };
    loadOptions();
    }, []);

  const CopyPromptButton = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
        } catch (err) {
        console.error('Error copiando al portapapeles:', err);
        }
    };

    return (
        <button
        className={`copy-button ${copied ? 'copied' : ''}`}
        onClick={handleCopy}
        title="Copiar al portapapeles"
        >
        {copied ? '✅' : '📋'}
        </button>
    );
    };


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
    else {
    if (customName) params.append('characterName', customName);
    if (customFrom) params.append('characterFrom', customFrom);
    }
    if (nsfwOnly) params.append('nsfwOnly', 'true');
    if (selectedStyles.length) params.append('style', selectedStyles.map(s => s.value).join(','));
    if (selectedViews.length) params.append('view', selectedViews.map(v => v.value).join(','));
    if (selectedOutfits.length) params.append('outfit', selectedOutfits.map(o => o.value).join(','));
    if (selectedLocations.length) params.append('location', selectedLocations.map(l => l.value).join(','));
    if (selectedPoses.length) params.append('pose', selectedPoses.map(p => p.value).join(','));
    if (selectedTags.length) params.append('tags', selectedTags.map(t => t.value).join(','));


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
        const { label, from, age, nsfw } = option.data;

        return (
            label.toLowerCase().includes(inputValue.toLowerCase()) ||
            from.toLowerCase().includes(inputValue.toLowerCase()) ||
            (age && age.toLowerCase().includes(inputValue.toLowerCase())) ||
            (nsfw && 'nsfw'.includes(inputValue.toLowerCase())) || 
            (!nsfw && 'no nsfw'.includes(inputValue.toLowerCase()))
        );
        };


    const options = characters
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
    });
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: '#1c1c1c',
            borderColor: state.isFocused ? '#666' : '#333',
            boxShadow: state.isFocused ? '0 0 0 1px #888' : 'none',
            color: '#fff',
            '&:hover': {
            borderColor: '#888',
            },
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: '#121212',
            color: '#fff',
            zIndex: 99,
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#333' : '#121212',
            color: '#fff',
            padding: 10,
            cursor: 'pointer',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#fff',
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#2a2a2a',
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: '#fff',
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: '#ccc',
            ':hover': {
            backgroundColor: '#444',
            color: '#fff',
            },
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#aaa',
        }),
        input: (provided) => ({
            ...provided,
            color: '#fff',
        }),
        };
        const downloadGeneratedCSV = () => {
            if (!prompts.length) return;

            const header = 'Prompt\n';
            const content = prompts.map(p => `"${p.replace(/"/g, '""')}"`).join('\n');
            const blob = new Blob([header + content], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'prompts_generados.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            };
    return (
    <div className="anime-generator-container">
        <h1 className="anime-generator-title">🎨 Generador de Prompts Anime</h1>
        <div className="anime-generator-layout">
        <div className="anime-generator-columns">
        {/* FILTROS A LA IZQUIERDA */}
        <div className="anime-generator-filters">
            <h3>🎛️ Filtros opcionales</h3>

            <label>Estilos:</label>
            <Select options={styles.map(s => ({ value: s.style, label: s.style }))} isMulti value={selectedStyles} onChange={setSelectedStyles} placeholder="Todos" styles={customSelectStyles}/>

            <label>Ángulos de vista:</label>
            <Select options={views.map(v => ({ value: v.view, label: v.view }))} isMulti value={selectedViews} onChange={setSelectedViews} placeholder="Todos" styles={customSelectStyles}/>

            <label>Ropa:</label>
            <Select options={outfits.map(o => ({ value: o.description, label: o.description }))} isMulti value={selectedOutfits} onChange={setSelectedOutfits} placeholder="Todas" styles={customSelectStyles}/>

            <label>Ubicaciones:</label>
            <Select options={locations.map(l => ({ value: l.place, label: l.place }))} isMulti value={selectedLocations} onChange={setSelectedLocations} placeholder="Todas" styles={customSelectStyles} />

            <label>Poses:</label>
            <Select options={poses.map(p => ({ value: p.pose, label: p.pose }))} isMulti value={selectedPoses} onChange={setSelectedPoses} placeholder="Todas" styles={customSelectStyles} />

            <label>Etiquetas:</label>
            <Select options={tags.map(t => ({ value: t.value, label: t.value }))} isMulti value={selectedTags} onChange={setSelectedTags} placeholder="Todas" styles={customSelectStyles}/>

            <button type="button" onClick={() => {
            setSelectedStyles([]);
            setSelectedViews([]);
            setSelectedOutfits([]);
            setSelectedLocations([]);
            setSelectedPoses([]);
            setSelectedTags([]);
            }}>
            🔄 Limpiar filtros
            </button>
        </div>

        {/* FORMULARIO A LA DERECHA */}
        <form className="anime-generator-form" onSubmit={handleSubmit}>
            
            <label>
            Cantidad de combinaciones:
            <input type="number" value={n} onChange={(e) => setN(Number(e.target.value))} min={1} max={100} />
            </label>

            <div className="nsfw-toggle">
                <label className="switch">
                    <input
                    type="checkbox"
                    checked={nsfwOnly}
                    onChange={(e) => setNsfwOnly(e.target.checked)}
                    />
                    <span className="slider" />
                </label>
                <span className="nsfw-label">🔞 Incluir contenido NSFW (si es posible)</span>
                </div>

            <label>Selecciona un personaje:</label>
            <Select
            options={options}
            value={options.find(o => o.value === characterId) || null}
            onChange={(selected) => setCharacterId(selected?.value || '')}
            getOptionValue={(e) => e.value}
            getOptionLabel={(e) => (
                <div className="custom-option">
                <img src={e.image} alt={e.label} className="option-img" />
                <div className="option-details">
                    <div><strong>{e.label}</strong> ({e.age})</div>
                    <div><em>{e.from}</em></div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: e.nsfw ? '#3ee85d' : '#ff4f4f' }}>
                    {e.nsfw ? '🔞 NSFW permitido' : '❌ NSFW no permitido'}
                    </div>
                </div>
                </div>
            )}
            placeholder="Buscar personaje..."
            isSearchable
            filterOption={filterOption}
            styles={customSelectStyles}
            />

            {characterId && (
            <button type="button" className="clear-select-button" onClick={() => {
                setCharacterId('');
                setCustomName('');
                setCustomFrom('');
            }}>
                ❌ Quitar selección
            </button>
            )}

            {!characterId && (
            <div className="manual-character-fields">
                <label>Nombre del personaje:
                <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Ej: Yoruichi" />
                </label>
                <label>Obra / Anime:
                <input type="text" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} placeholder="Ej: Bleach" />
                </label>
            </div>
            )}

            <button type="submit" className="generate-button" disabled={loading}>
            {loading ? 'Generando...' : '🔄 Generar prompts'}
            </button>
            {loading && (
            <div className="global-loader">
                <div className="spinner" />
                <span>Generando prompts, por favor espera...</span>
            </div>
            )}
        </form>
        </div>

        {/* ERRORES Y PREVIEW */}
        {error && <p className="error-msg">{error}</p>}

        {prompts.length > 0 && (
            <div className="prompt-preview">
                <h3>📝 Vista previa de prompts generados:</h3>
                <ul className="prompt-list">
                {prompts.map((line, idx) => (
                    <li key={idx} className="prompt-line">
                    <span>{line}</span>
                    <CopyPromptButton text={line} />
                    </li>
                ))}
                </ul>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button
                    className="download-button"
                    onClick={() => {
                    const params = new URLSearchParams({ n, format: 'csv' });
                    if (characterId) params.append('characterId', characterId);
                    else {
                        if (customName) params.append('characterName', customName);
                        if (customFrom) params.append('characterFrom', customFrom);
                    }
                    if (nsfwOnly) params.append('nsfwOnly', 'true');
                    const downloadUrl = `${process.env.REACT_APP_API_URL}/api/anime-prompts/random?${params}`;
                    window.open(downloadUrl, '_blank');
                    }}
                >
                    📥 Descargar CSV
                </button>

                <button
                    className="download-button"
                    onClick={() => {
                    if (!prompts.length) return;
                    const header = 'Prompt\n';
                    const content = prompts.map(p => `"${p.replace(/"/g, '""')}"`).join('\n');
                    const blob = new Blob([header + content], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'prompts_generados.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    }}
                >
                    📄 Descargar CSV Generado
                </button>
                </div>
            </div>
            )}
    </div>
    </div>
    );

};

export default AnimePromptGenerator;
