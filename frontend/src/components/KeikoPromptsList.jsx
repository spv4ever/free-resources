// src/components/KeikoPromptsList.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/KeikoPromptsList.css';
import AspectRatioSelector from '../components/AspectRatioSelector';
import '../styles/AspectRatioSelector.css';
import { useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext'; 

export default function KeikoPromptsList() {
  const { user, loading } = useUser();
  const { packId } = useParams();
  const [pack, setPack] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterAccess, setFilterAccess] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [generando, setGenerando] = useState(null);
  const [imagenes, setImagenes] = useState({});
  const [pendientes, setPendientes] = useState({});
  const [pendientesTimestamps, setPendientesTimestamps] = useState({});
  const [selectedRatio, setSelectedRatio] = useState('3:4');
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState({});
  const [progresoGeneracion, setProgresoGeneracion] = useState({});

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/comfy/jobs`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const mapeoProgreso = {};
        const cola = data
          .filter(j => j.status === 'queued')
          .sort((a, b) => a.createdAt - b.createdAt);

        for (let i = 0; i < data.length; i++) {
          const { promptId, progress, status } = data[i];
          if (status === 'running' || status === 'queued') {
            mapeoProgreso[promptId] = {
              progress: Math.round(progress * 100),
              colaIndex: status === 'queued'
                ? cola.findIndex(j => j.promptId === promptId) + 1
                : null
            };
          }
        }

        setProgresoGeneracion(mapeoProgreso);
      } catch (err) {
        console.warn('⚠️ Error consultando progreso:', err.message);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
  const interval = setInterval(() => {
    setTiempoTranscurrido((prev) => {
      const nuevo = {};
      Object.entries(pendientes).forEach(([id, info]) => {
        if (!info) return;

        const createdAt = typeof info.createdAt === 'string'
          ? new Date(info.createdAt).getTime()
          : typeof info.createdAt === 'number'
            ? info.createdAt
            : Date.now();

        const delta = Math.floor((Date.now() - createdAt) / 1000);
        nuevo[id] = delta;
      });
      return nuevo;
    });
  }, 1000);
  return () => clearInterval(interval);
}, [pendientes]);

  useEffect(() => {
    if (loading || !user || (user.role !== 'pro' && user.role !== 'admin')) return;
    axios.get(`${process.env.REACT_APP_API_URL}/api/keiko/packs/${packId}`)
      .then(({ data }) => setPack(data))
      .catch(console.error);

    axios.get(`${process.env.REACT_APP_API_URL}/api/keiko/prompts/by-pack/${packId}`)
      .then(({ data }) => setPrompts(data))
      .catch(console.error);
  }, [packId,user,loading]);

  if (loading) return <div className="page-loader">⏳ Cargando...</div>;
  if (!user) return <div className="restricted-area">
        <h2>🔒 Acceso restringido</h2>
        <p>Esta sección está disponible solo para usuarios registrados.</p>
      </div>
  // if (user.role !== 'pro' && user.role !== 'admin') {
  //   return (
  //     <div className="restricted-area">
  //       <h2>🔒 Acceso restringido</h2>
  //       <p>Esta sección está disponible solo para usuarios con nivel <strong>PRO</strong> o <strong>ADMIN</strong>.</p>
  //     </div>
  //   );
  // }
  

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
  
  const handleCopyAndOpen = (promptText, platform, id) => {
    if (platform.toLowerCase() === 'flux') {
      handleFluxPrompt(promptText, id);
      return;
    }

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
  };

  const handleFluxPrompt = async (promptText, promptId) => {
    try {
      setGenerando(promptId);

      const token = localStorage.getItem('token');

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/flux/generate`,
        {
          prompt: promptText,
          ratio: selectedRatio,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const prompt_id = data.prompt_id;

      setPendientes(prev => ({
        ...prev,
        [promptId]: {
          id: prompt_id,
          createdAt: Date.now()
        }
      }));

      setPendientesTimestamps(prev => ({ ...prev, [promptId]: Date.now() }));
      const currentPromptId = promptId;
      const currentPromptBackendId = prompt_id;

      setTimeout(() => {
        setPendientes(p => {
          if (p[currentPromptId]) {
            verificarImagenConRetry(currentPromptId, currentPromptBackendId);
          }
          return p;
        });
      }, 60000);
    } catch (err) {
      console.error('Error al generar con Flux:', err.message);
      alert('Error al generar imagen.');
    } finally {
      setGenerando(null);
    }
  };

  const verificarImagenConRetry = (promptId, prompt_id, intentos = 0) => {
    const token = localStorage.getItem('token');

    axios.get(
      `${process.env.REACT_APP_API_URL}/api/flux/verificar/${prompt_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then(({ data }) => {
        if (data.found) {
          // ✅ Pedimos la imagen protegida con token y blob
          axios.get(
            `${process.env.REACT_APP_API_URL}/api/flux/image/${data.filename}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              },
              responseType: 'blob'
            }
          )
            .then(res => {
              const imageUrl = URL.createObjectURL(res.data);
              setImagenes(prev => ({ ...prev, [promptId]: imageUrl }));
              setPendientes(prev => {
                const nuevo = { ...prev };
                delete nuevo[promptId];
                return nuevo;
              });
              setPendientesTimestamps(prev => {
                const nuevo = { ...prev };
                delete nuevo[promptId];
                return nuevo;
              });
            })
            .catch(err => {
              console.error('❌ Error al descargar imagen:', err.message);
            });
        } else {
          setTimeout(() => {
            verificarImagenConRetry(promptId, prompt_id, intentos + 1);
          }, 5000);
        }
      })
      .catch(err => {
        console.warn(`Verificación ${intentos} fallida (${prompt_id}):`, err.message);
        setTimeout(() => {
          verificarImagenConRetry(promptId, prompt_id, intentos + 1);
        }, 5000);
      });
  };

  const verificarImagen = async (promptId, prompt_id) => {
    const createdAt = pendientesTimestamps[promptId];
    if (createdAt && Date.now() - createdAt < 60000) {
      alert('⌛ Aún es muy pronto para verificar. Espera unos segundos más.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/flux/verificar/${prompt_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (data.found) {
        const imageResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/flux/image/${data.filename}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            responseType: 'blob'
          }
        );

        const imageUrl = URL.createObjectURL(imageResponse.data);
        setImagenes(prev => ({ ...prev, [promptId]: imageUrl }));

        const newPendientes = { ...pendientes };
        delete newPendientes[promptId];
        setPendientes(newPendientes);

        const newTimestamps = { ...pendientesTimestamps };
        delete newTimestamps[promptId];
        setPendientesTimestamps(newTimestamps);
      } else {
        alert('La imagen aún no está disponible. Intenta más tarde.');
      }
    } catch (err) {
      console.error('Error al verificar imagen:', err.message);
      alert('Error al verificar estado de la imagen.');
    }
  };
  
  if (loading) return <p>⏳ Cargando usuario...</p>;
  
  if (!user) {
    return <p>🔐 Debes iniciar sesión para ver esta sección.</p>;
  }

  

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
        </div>

        <div className="ratio-selector-wrapper">
          <p className="ratio-text">
            Proporción seleccionada: <strong>{selectedRatio}</strong>
          </p>
          <AspectRatioSelector selected={selectedRatio} onChange={setSelectedRatio} />
        </div>

        <div className="reset-wrapper">
          <button className="reset-btn" onClick={() => {
            setSearch('');
            setFilterPlatform('');
            setFilterAccess('');
            setSortField('createdAt');
            setSortOrder('desc');
            setSelectedRatio('3:4');
          }}>
            🔄 Limpiar filtros
          </button>
        </div>
      </div>

      <div className="prompts-list-rows">
        {displayed.length === 0 && (
          <p className="no-results">No hay prompts que coincidan.</p>
        )}
        {displayed.map(p => (
          <div key={p._id} className="prompt-card-wrapper">
            <div className="prompt-row two-column">
              <div className="prompt-content">
                <div className="row-header">
                  <h2 className="prompt-scene">{p.scene}</h2>
                  <div className="prompt-actions">
                    <button className="copy-btn" onClick={() => copyToClipboard(p.prompt)}>📋 Copiar</button>
                    <button
                      className="open-btn"
                      onClick={() => handleCopyAndOpen(p.prompt, p.platform, p._id)}
                      disabled={generando === p._id}
                    >
                      🚀 {p.platform.toLowerCase() === 'flux' ? 'Generar en Flux' : 'Copiar y Abrir IA'}
                    </button>
                  </div>
                </div>

                <pre className="prompt-box">{p.prompt}</pre>

                {/* ⏳ PROGRESO DE GENERACIÓN */}
                {pendientes[p._id] && (
                  <div className="flux-pending-box">
                    <p>
                      ⏳ Imagen pendiente de generación…
                      {typeof tiempoTranscurrido[p._id] === 'number' && (
                        <span> ({tiempoTranscurrido[p._id]}s)</span>
                      )}
                      {progresoGeneracion[pendientes[p._id]?.id] && progresoGeneracion[pendientes[p._id]?.id].colaIndex !== undefined && (
                        <span> – 🕓 En cola (#{progresoGeneracion[pendientes[p._id].id].colaIndex})</span>
                      )}
                      {progresoGeneracion[pendientes[p._id]?.id] && typeof progresoGeneracion[pendientes[p._id].id].progress === 'number' && (
                        <span> – Progreso: {progresoGeneracion[pendientes[p._id].id].progress}%</span>
                      )}
                    </p>
                    <button onClick={() => verificarImagen(p._id, pendientes[p._id])}>
                      🔄 Verificar estado
                    </button>
                  </div>
                )}


                {generando === p._id && !imagenes[p._id] && !pendientes[p._id] && (
                  <p>⏳ Generando imagen con Flux…</p>
                )}

                <div className="row-meta">
                  <span className="chip">{p.platform}</span>
                  <span className="chip">{p.access}</span>
                  <span className="chip">{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* ✅ SOLO LA IMAGEN A LA DERECHA */}
              <div className="prompt-status-image">
                {p.platform.toLowerCase() === 'flux' && (
                  imagenes[p._id] ? (
                    <img
                      src={imagenes[p._id]}
                      alt="Imagen generada"
                      className="flux-thumbnail"
                      onClick={() => window.open(imagenes[p._id], '_blank')}
                    />
                  ) : (
                    <div className="image-placeholder">🖼 Esperando imagen...</div>
                  )
                )}
              </div>
            </div>
          </div>
        ))}



      </div>
    </div>
  );
}
