// src/components/KeikoPromptsList.jsx
// import Select from 'react-select';
import React, { useEffect, useState, useMemo  } from 'react';
import axios from 'axios';
import '../styles/KeikoPromptsList.css';
import AspectRatioSelector from '../components/AspectRatioSelector';
import '../styles/AspectRatioSelector.css';
import { useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext'; 
import { useNavigate } from 'react-router-dom';
import BotonBiblioteca from '../components/BotonBiblioteca';
// import PromptCard from './PromptCard';
import PromptCardRedesigned from './PromptCardRedesigned';
import ScrollToTopButton from '../components/ScrollToTopButton';
import AlertaModal from './AlertaModal';
import imgSinTokens from '../assets/sin_tokens.png'; // pon ahí tu imagen divertida
import qs from 'qs'; // al principio del archivo
// import AdBanner from '../components/AdBanner';
// import { FixedSizeList as List } from 'react-window';

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
  const [selectedExtras, setSelectedExtras] = useState({});
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [promptsPerPage, setPromptsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [errorModal, setErrorModal] = useState(null);
  const [useRandomSeed, setUseRandomSeed] = useState(true);
  const [customSeed, setCustomSeed] = useState('');
  const [totalPromptsPack, setTotalPromptsPack] = useState(0);
  const [availableOptions, setAvailableOptions] = useState({}); // datos de /options/by-group
  const [extraFilters, setExtraFilters] = useState({}); // valores seleccionados por grupo
  const [advancedMode, setAdvancedMode] = useState(false);
  const [removeBackground, setRemoveBackground] = useState(true);
  const isProUser = useMemo(() => ['admin', 'pro'].includes(user?.role), [user]);
  const [customText, setCustomText] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [customReplacement, setCustomReplacement] = useState({});
  
  
  
useEffect(() => {
    if (document.querySelector('script[data-name="BMC-Widget"]')) return;

    const script = document.createElement("script");
    script.setAttribute("data-name", "BMC-Widget");
    script.setAttribute("data-cfasync", "false");
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js";
    script.setAttribute("data-id", "keikodev");
    script.setAttribute("data-description", "Support me on Buy me a coffee!");
    script.setAttribute("data-message", "Gracias por tu apoyo en el proyecto, en breve recibirás tokens gratis para seguir creando.");
    script.setAttribute("data-color", "#26B0A1");
    script.setAttribute("data-position", "Right");
    script.setAttribute("data-x_margin", "18");
    script.setAttribute("data-y_margin", "18");

    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/keiko/options/used-in-pack/${packId}`)
      .then(res => setAvailableOptions(res.data))
      .catch(err => console.error('Error cargando opciones dinámicas:', err));
  },[packId]);

  useEffect(() => {
    if (Object.keys(pendientes).length === 0) return; // ❌ Nada pendiente, no hacemos polling

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/comfy/jobs`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const mapeoProgreso = {};
        const cola = data.filter(j => j.status === 'queued').sort((a, b) => a.createdAt - b.createdAt);

        for (let { promptId, progress, status } of data) {
          if (status === 'running' || status === 'queued') {
            mapeoProgreso[promptId] = {
              progress: Math.round(progress * 100),
              colaIndex: status === 'queued'
                ? cola.findIndex(j => j.promptId === promptId) + 1
                : null
            };
          }
        }

        setProgresoGeneracion(prev => {
          return JSON.stringify(prev) === JSON.stringify(mapeoProgreso) ? prev : mapeoProgreso;
        });
      } catch (err) {
        console.warn('⚠️ Error consultando progreso:', err.message);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pendientes]);

  const handlePromptUpdated = (id, patch) => {
    // Actualización inmutable del array
    setPrompts(prev =>
      prev.map(p => (p._id === id ? { ...p, ...patch } : p))
    );
  };

  useEffect(() => {
    if (Object.keys(pendientes).length === 0) return;

    const interval = setInterval(() => {
      setTiempoTranscurrido(prev => {
        const nuevo = {};
        let cambiado = false;

        Object.entries(pendientes).forEach(([id, info]) => {
          if (!info) return;

          const createdAt = typeof info.createdAt === 'string'
            ? new Date(info.createdAt).getTime()
            : typeof info.createdAt === 'number'
              ? info.createdAt
              : Date.now();

          const delta = Math.floor((Date.now() - createdAt) / 1000);
          nuevo[id] = delta;
          if (prev[id] !== delta) cambiado = true;
        });

        return cambiado ? nuevo : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pendientes]);


  useEffect(() => {
    if (loading) return;
    axios.get(`${process.env.REACT_APP_API_URL}/api/keiko/packs/${packId}`)
      .then(({ data }) => setPack(data))
      .catch(console.error);

    
    axios.get(`${process.env.REACT_APP_API_URL}/api/keiko/prompts/by-pack-paginated/${packId}`, {
      params: {
        search,
        platform: filterPlatform,
        access: filterAccess,
        sortField,
        sortOrder,
        page: currentPage,
        limit: promptsPerPage,
        filters: extraFilters
      },
      paramsSerializer: params => qs.stringify(params, { encode: false })
    })
    .then(({ data }) => {
      setPrompts(data.prompts);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
      setTotalPromptsPack(data.total || data.totalPrompts || data.prompts.length); // depende del backend
    })
    .catch(console.error);

  }, [packId,
  user,
  loading,
  search,
  filterPlatform,
  filterAccess,
  sortField,
  sortOrder,
  currentPage,
  promptsPerPage,
  extraFilters // ✅ aquí lo añades
]);

useEffect(() => {
  const cargarPreviews = async () => {
    const nuevasPreviews = {};

    for (const prompt of prompts) {
      if (prompt.platform?.toLowerCase() === 'flux') {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/keiko/prompts/ultima-imagen/${prompt._id}`);
          if (res.data?.url) {
            nuevasPreviews[prompt._id] = res.data.url;
          }
        } catch (err) {
          console.warn(`⚠️ No se pudo cargar preview para prompt ${prompt._id}:`, err.message);
        }
      }
    }

    setImagePreviews(nuevasPreviews);
  };

  if (prompts?.length > 0) {
    cargarPreviews();
  }
}, [prompts]);


  // useEffect(() => {
  //     if (loading || !user) return;

  //     axios.get(`${process.env.REACT_APP_API_URL}/api/keiko/prompts/by-pack-paginated/${packId}`, {
  //       params: {
  //         search,
  //         platform: filterPlatform,
  //         access: filterAccess,
  //         sortField,
  //         sortOrder,
  //         page: currentPage,
  //         limit: promptsPerPage
  //       }
  //     })
  //       .then(({ data }) => {
  //         setPrompts(data.prompts);
  //         setTotalPages(data.totalPages);
  //         setCurrentPage(data.page);
  //       })
  //       .catch(console.error);
  //   }, [
  //     search, filterPlatform, filterAccess, sortField, sortOrder,
  //     currentPage, promptsPerPage, packId, user, loading
  //   ]);

  if (loading) return <div className="page-loader">⏳ Cargando...</div>;
  // if (!user) return <div className="restricted-area">
  //       <h2>🔒 Acceso restringido</h2>
  //       <p>Esta sección está disponible solo para usuarios registrados.</p>
  //     </div>
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

  
  const displayed = prompts;
  
  const handleCopyAndOpen = (promptText, platform, id, options = {}) => {
    if (platform.toLowerCase() === 'flux') {
      handleFluxPrompt({
        promptText,
        promptId: id,
        ...options
      });
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

  const handleFluxPrompt = async ({
    promptText,
    promptId,
    selectedExtras = [],
    advancedMode = false,
    removeBackground = false,
    esPublica = false
  }) => {
    try {
      setImagenes(prevImagenes => {
        const newImagenes = { ...prevImagenes };
        delete newImagenes[promptId];
        return newImagenes;
      });

      setGenerando(promptId);

      const extras = selectedExtras.map(e => (typeof e === 'string' ? e : e?.value)).filter(Boolean);
      const finalPrompt = extras.length > 0
        ? `${extras.join(', ')}, ${promptText}`.trim()
        : promptText.trim();

      console.log('🧪 Prompt final:', finalPrompt); // ✅ verificación
      console.log('📦 Extras:', extras);

      const token = localStorage.getItem('token');

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/flux/generate`,
        {
          prompt: finalPrompt,
          ratio: selectedRatio,
          steps: pack?.category === 'Anime' ? 30 : 15,
          seed: (isProUser && !useRandomSeed) ? parseInt(customSeed) : undefined,
          promptRef: promptId,
          advancedMode,
          removeBackground,
          esPublica
        },
        {
          headers: { Authorization: `Bearer ${token}` }
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

      setTimeout(() => {
        setPendientes(p => {
          if (p[promptId]) {
            verificarImagenConRetry(promptId, prompt_id);
          }
          return p;
        });
      }, 20000);
    } catch (err) {
      console.error('Error al generar con Flux:', err.message);
      if (err.response?.status === 403) {
        setErrorModal({
          mensaje: 'No tienes tokens suficientes para generar imágenes.',
          link: '/info/tokens',
          imagen: imgSinTokens
        });
      } else {
        setErrorModal({
          mensaje: 'Ocurrió un error al generar la imagen. Inténtalo más tarde.'
        });
      }
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
 const opcionesAuxiliares = [
  { value: 'white background', label: 'White background' },
  { value: 'neutral background', label: 'Neutral background' },
  { value: 'aidmaHyperrealism', label: 'Realistic image' },
  { value: 'blurred background', label: 'Blurred background' },
  { value: 'chromatic background', label: 'Chromatic background' }, // 🆕 para keying
  { value: 'soft lighting', label: 'Soft lighting' },
  { value: 'extra detail', label: 'Extra detail' },
  { value: 'black and white', label: 'Black & White' },
  { value: 'HDR lighting', label: 'High contrast' }
];

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
  
  // if (!user) {
  //   return <p>🔐 Debes iniciar sesión para ver esta sección.</p>;
  // }

  

  if (!pack) return <p>Cargando pack…</p>;
  return (
    <div className="keiko-user-container">
      {/* <AdBanner /> */}
      <div id="prompt-section" className="pack-header-container">
        <h1 className="pack-title">{pack.title}</h1>
        <p className="pack-desc">{pack.description}</p>

        <div className="pack-total-prompts">
          📦 <span>{totalPromptsPack.toLocaleString('es-ES')}</span> Prompts
        </div>
      </div>

      <div className="filters-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar título o prompt"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="filtros-bar-v2">
          <button
            className="orden-campo"
            onClick={() => {
              const next = sortField === 'createdAt' ? 'scene' : sortField === 'scene' ? 'platform' : 'createdAt';
              setSortField(next);
            }}
          >
            Ordenar por: <strong>{sortField === 'createdAt' ? 'Fecha' : sortField === 'scene' ? 'Título' : 'Plataforma'}</strong>
          </button>

          <button
            className="orden-toggle"
            onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
          >
            {sortOrder === 'asc' ? '⬆ Ascendente' : '⬇ Descendente'}
          </button>

          <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className="dropdown-filter">
            <option value="">Todas las plataformas</option>
            {platforms.map(pl => <option key={pl} value={pl}>{pl}</option>)}
          </select>

          <select value={filterAccess} onChange={e => setFilterAccess(e.target.value)} className="dropdown-filter">
            <option value="">Todos los accesos</option>
            {accesses.map(ac => <option key={ac} value={ac}>{ac}</option>)}
          </select>
          {Object.entries(availableOptions).map(([groupName, options]) => (
            <select
              key={groupName}
              value={extraFilters[groupName] || ''}
              onChange={e => {
                const value = e.target.value;
                setExtraFilters(prev => {
                  const updated = { ...prev };
                  if (value === '') {
                    delete updated[groupName]; // elimina el filtro si se escoge la opción por defecto
                  } else {
                    updated[groupName] = value;
                  }
                  return updated;
                });
                setCurrentPage(1); // reset page
              }}
              className="dropdown-filter"
            >
              <option value="">{groupName.charAt(0).toUpperCase() + groupName.slice(1)}</option>
              {options.map(opt => (
                <option key={opt.name} value={opt.name}>{opt.label}</option>
              ))}
            </select>
          ))}

          

          <button className="reset-btn" onClick={() => {
            setSearch('');
            setFilterPlatform('');
            setFilterAccess('');
            setSortField('createdAt');
            setSortOrder('desc');
            setSelectedRatio('3:4');
            setExtraFilters({});
          }}>🔄 Limpiar filtros</button>

          <button className="reset-btn" onClick={() => navigate('/keikoprompts')}>⬅ Volver a Packs</button>

          <button className="reset-btn" onClick={() => setMostrarOpciones(true)}>
            ⚙ Opciones avanzadas ({selectedRatio})
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <BotonBiblioteca />
        </div>
        {mostrarOpciones && (
          <div className="modal-overlay" onClick={() => setMostrarOpciones(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>⚙ Opciones avanzadas</h3>
              <AspectRatioSelector selected={selectedRatio} onChange={setSelectedRatio} />
              {(user.role === 'pro' || user.role === 'admin') ? (
                <div className="seed-options">
                  <label className="seed-toggle">
                    <input
                      type="checkbox"
                      checked={useRandomSeed}
                      onChange={() => setUseRandomSeed(!useRandomSeed)}
                    />
                    Usar semilla aleatoria
                  </label>

                  {!useRandomSeed && (
                    <div className="seed-fixed-input">
                      <input
                        type="number"
                        value={customSeed}
                        onChange={(e) => setCustomSeed(e.target.value)}
                        placeholder="Introduce una semilla"
                      />
                      <button
                        onClick={() => {
                          const nueva = Math.floor(Math.random() * 1_000_000_000).toString();
                          setCustomSeed(nueva);
                        }}
                      >
                        Generar aleatoria
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="seed-options disabled">
                  <p>🎲 Opción de semilla solo disponible para usuarios Pro.</p>
                </div>
              )}
              <button className="close-modal" onClick={() => setMostrarOpciones(false)}>✖ Cerrar</button>
            </div>
          </div>
        )}
      </div>
      {totalPages > 1 && (
          <div className="pagination-controls">
            <label>Prompts por página:</label>
            <select
              value={promptsPerPage}
              onChange={e => {
                setPromptsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[10, 16, 20, 30, 50].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              ⏮ Inicio
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ◀ Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente ▶
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Fin ⏭
            </button>
          </div>
        )}

      <div className="prompts-list-rows">
        {displayed.length === 0 && (
          <p className="no-results">No hay prompts que coincidan.</p>
        )}
        {displayed.map(p => {
          const promptWithCategory = {
            ...p,
            category: pack?.category // ✅ Añade la categoría del pack
          };

          return (
            <PromptCardRedesigned 
              key={promptWithCategory._id}
              prompt={promptWithCategory}
              imagenPreviewUrl={imagePreviews[promptWithCategory._id] || null}
              imagenes={imagenes}
              pendientes={pendientes}
              tiempoTranscurrido={tiempoTranscurrido}
              progresoGeneracion={progresoGeneracion}
              generando={generando}
              selectedExtras={selectedExtras}
              setSelectedExtras={setSelectedExtras}
              handleCopyAndOpen={handleCopyAndOpen}
              copyToClipboard={copyToClipboard}
              verificarImagen={verificarImagen}
              opcionesAuxiliares={opcionesAuxiliares}
              advancedMode={advancedMode}
              setAdvancedMode={setAdvancedMode}
              removeBackground={removeBackground}
              setRemoveBackground={setRemoveBackground}
              isProUser={isProUser}
              customText={customText}
              setCustomText={setCustomText}
              customReplacement={customReplacement}
              setCustomReplacement={setCustomReplacement}
              onPromptUpdated={handlePromptUpdated}   // ⬅️ importante
            />
          );
        })}

        {totalPages > 1 && (
          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              ⏮ Inicio
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ◀ Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente ▶
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Fin ⏭
            </button>
          </div>
        )}
      </div>
        <ScrollToTopButton />
        {errorModal && (
        <AlertaModal
          mensaje={errorModal.mensaje}
          link={errorModal.link}
          imagen={errorModal.imagen} // ✅ añadir esta línea
          onClose={() => setErrorModal(null)}
        />
      )}
        
    </div>
    
  );
}
