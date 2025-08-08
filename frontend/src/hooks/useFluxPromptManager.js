// src/hooks/useFluxPromptManager.js
import { useState, useEffect, useCallback  } from 'react';
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
          ratio: ratio || selectedRatio || '3:4',
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

      // ❌ Ya no se lanza verificación desde aquí (se hace al detectar progreso 100%)

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

  const verificarImagenConRetry = useCallback((promptId, prompt_id, intentos = 0) => {
    const token = localStorage.getItem('token');

    if (intentos >= 10) {
      console.warn(`🛑 Se detuvo la verificación de ${prompt_id} tras 10 intentos.`);
      return;
    }

    axios.get(`${process.env.REACT_APP_API_URL}/api/flux/verificar/${prompt_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(({ data }) => {
        if (!data?.found) {
          setTimeout(() => {
            verificarImagenConRetry(promptId, prompt_id, intentos + 1);
          }, 15000); // más espaciamiento
          return;
        }

        if (data.finalUrl) {
          setImagenes(prev => ({ ...prev, [promptId]: data.finalUrl }));
          limpiarPendiente(promptId);
          return;
        }

        // fallback a imagen temporal (blob)
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
            limpiarPendiente(promptId); // aunque falle, limpiar
          });
      })
      .catch(err => {
        console.warn(`⚠️ Verificación fallida (${intentos}):`, err.message);
        setTimeout(() => {
          verificarImagenConRetry(promptId, prompt_id, intentos + 1);
        }, 15000);
      });
  }, []);

  const verificarImagen = async (promptId, prompt_id) => {
    const createdAt = pendientesTimestamps[promptId];
    if (createdAt && Date.now() - createdAt < 60000) {
      alert('⌛ Aún es muy pronto para verificar. Espera unos segundos más.');
      return;
    }
    verificarImagenConRetry(promptId, prompt_id);
  };

  // ⏱ Tiempo transcurrido desde que se lanzó la imagen
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

  // 🔄 Consulta periódica de progreso de jobs activos
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
        console.warn('⚠️ Error consultando progreso:', err.message);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pendientes, imagenes]);

  // 🔁 Lanzar verificación cuando una imagen alcance 100%
  useEffect(() => {
    Object.entries(progresoGeneracion).forEach(([prompt_id, { progress }]) => {
      if (progress !== 100) return;

      const promptEntry = Object.entries(pendientes).find(
        ([_, info]) => info?.id === prompt_id
      );

      if (!promptEntry) return;

      const [promptId] = promptEntry;

      if (!imagenes[promptId]) {
        console.log(`📸 Progreso completo para ${promptId}, iniciando verificación`);
        verificarImagenConRetry(promptId, prompt_id);
      }
    });
  }, [progresoGeneracion, pendientes, imagenes, verificarImagenConRetry]);

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
