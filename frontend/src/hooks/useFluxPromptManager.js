import { useState, useEffect } from 'react';
import axios from 'axios';
import imgSinTokens from '../assets/sin_tokens.png';

export default function useFluxPromptManager({ pack, isProUser, selectedRatio }) {
  const [generando, setGenerando] = useState(null);
  const [imagenes, setImagenes] = useState({});
  const [pendientes, setPendientes] = useState({});
  const [pendientesTimestamps, setPendientesTimestamps] = useState({});
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState({});
  const [progresoGeneracion, setProgresoGeneracion] = useState({});
  const [errorModal, setErrorModal] = useState(null);

  const limpiarPendiente = (promptId) => {
    setPendientes(p => {
      const nuevo = { ...p };
      delete nuevo[promptId];
      return nuevo;
    });
    setPendientesTimestamps(p => {
      const nuevo = { ...p };
      delete nuevo[promptId];
      return nuevo;
    });
  };

  const handleFluxPrompt = async ({
    promptText,
    promptId,
    selectedExtras = [],
    advancedMode = false,
    removeBackground = false,
    seed, 
    ratio,
    steps,
    esPublica = false,
    useRandomSeed = true
  }) => {
    try {
      setImagenes(prev => {
        const updated = { ...prev };
        delete updated[promptId];
        return updated;
      });

      setGenerando(promptId);

      const extras = selectedExtras.map(e => e.value);
      const finalPrompt = `${extras.join(', ')}, ${promptText}`.trim();
      const token = localStorage.getItem('token');

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/flux/generate`,
        {
          prompt: finalPrompt,
          ratio: ratio || selectedRatio || '3:4',  // 👈 Aplica el ratio recibido
          // steps: pack?.category === 'Anime' ? 30 : 15,
          seed: (!useRandomSeed && seed) ? parseInt(seed) : undefined,
          promptRef: promptId,
          advancedMode,
          removeBackground,
          steps: typeof steps === 'number' ? steps : (pack?.category === 'Anime' ? 30 : 15),
          esPublica 
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const prompt_id = data.prompt_id;

      setPendientes(prev => ({
        ...prev,
        [promptId]: { id: prompt_id, createdAt: Date.now() }
      }));

      setPendientesTimestamps(prev => ({ ...prev, [promptId]: Date.now() }));

      // ✅ Verificación programada
      setTimeout(() => {
        verificarImagenConRetry(promptId, prompt_id);
      }, 5000);

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

    axios.get(`${process.env.REACT_APP_API_URL}/api/flux/verificar/${prompt_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(({ data }) => {
      if (!data?.found) {
        setTimeout(() => {
          verificarImagenConRetry(promptId, prompt_id, intentos + 1);
        }, 5000);
        return;
      }

      if (data.finalUrl) {
        setImagenes(prev => ({ ...prev, [promptId]: data.finalUrl }));
        limpiarPendiente(promptId);
        return;
      }

      // Fallback a blob si no hay finalUrl
      axios.get(`${process.env.REACT_APP_API_URL}/api/flux/image/${data.filename}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })
      .then(res => {
        const imageUrl = URL.createObjectURL(res.data);
        setImagenes(prev => ({ ...prev, [promptId]: imageUrl }));
        limpiarPendiente(promptId);
      })
      .catch(err => {
        console.error('❌ Error al descargar imagen local:', err.message);
        limpiarPendiente(promptId); // aún así limpiar
      });

    })
    .catch(err => {
      console.warn(`Verificación ${intentos} fallida:`, err.message);
      setTimeout(() => {
        verificarImagenConRetry(promptId, prompt_id, intentos + 1);
      }, 5000);
    });
  };

  useEffect(() => {
    if (Object.keys(pendientes).length === 0) return;

    const interval = setInterval(() => {
      setTiempoTranscurrido(prev => {
        const nuevo = {};
        let cambiado = false;
        Object.entries(pendientes).forEach(([id, info]) => {
          if (!info) return;
          const createdAt = new Date(info.createdAt).getTime();
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
    if (Object.keys(pendientes).length === 0) return;

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/comfy/jobs`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const mapeoProgreso = {};
        const cola = data.filter(j => j.status === 'queued').sort((a, b) => a.createdAt - b.createdAt);

        for (let { promptId, progress, status } of data) {
          // ✅ Saltar si ya tenemos imagen cargada
          if (imagenes[promptId]) continue;

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
        console.warn('Error consultando progreso:', err.message);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pendientes, imagenes]);

  const verificarImagen = async (promptId, prompt_id) => {
    const createdAt = pendientesTimestamps[promptId];
    if (createdAt && Date.now() - createdAt < 60000) {
      alert('⌛ Aún es muy pronto para verificar. Espera unos segundos más.');
      return;
    }
    verificarImagenConRetry(promptId, prompt_id);
  };

  return {
    generando,
    imagenes,
    pendientes,
    tiempoTranscurrido,
    progresoGeneracion,
    errorModal,
    setErrorModal,
    handleFluxPrompt,
    verificarImagen
  };
}
