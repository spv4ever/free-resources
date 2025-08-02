import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import PromptImageModal from './PromptImageModal';
import '../styles/PromptCard.css';

const opcionesPrompt = [
  {
    id: '686d5ddec0fb0ea9a784ac93',
    label: '🧪 Prompt Libre (Flux)',
    plataforma: 'flux'
  },
  {
    id: '686d7e40c0fb0ea9a784b429',
    label: '🎌 Prompt Anime (Flux)',
    plataforma: 'flux'
  }
];

const PromptLibreCard = ({
  imagenes,
  pendientes,
  tiempoTranscurrido,
  progresoGeneracion,
  generando,
  handleCopyAndOpen,
  handleFluxPrompt,
  verificarImagen
}) => {
  const { user } = useUser();
  const [promptSeleccionado, setPromptSeleccionado] = useState(opcionesPrompt[0]);
  const promptId = promptSeleccionado.id;
  const isPending = pendientes[promptId];
  const imageUrl = imagenes[promptId];
  const isGenerating = generando === promptId;
  const [inputText, setInputText] = useState('');
  const [modalImage, setModalImage] = useState(null);
  const [esPublica, setEsPublica] = useState(false);

  const [steps, setSteps] = useState(() => {
    const stored = localStorage.getItem('keiko_steps');
    return stored ? parseInt(stored) : 20;
  });

  const [localRatio, setLocalRatio] = useState(() => {
    return localStorage.getItem('keiko_ratio') || '3:4';
  });

  useEffect(() => {
    localStorage.setItem('keiko_steps', steps);
  }, [steps]);

  useEffect(() => {
    localStorage.setItem('keiko_ratio', localRatio);
  }, [localRatio]);

  // ⏱️ Verificación automática con reintentos cuando el progreso llega al 100%
  useEffect(() => {
    if (!isPending) return;

    const progreso = progresoGeneracion[isPending.id]?.progress;

    if (progreso === 100 && !imagenes[promptId]) {
      console.log('🟢 Lanzando verificación automática con retry desde PromptLibreCard');

      const token = localStorage.getItem('token');

      const retryVerificacion = (intentos = 0) => {
        if (intentos >= 10) {
          console.warn('❌ Verificación fallida tras 10 intentos.');
          return;
        }

        fetch(`${process.env.REACT_APP_API_URL}/api/flux/verificar/${isPending.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (!data?.found) {
              setTimeout(() => retryVerificacion(intentos + 1), 15000);
              return;
            }

            if (data.finalUrl) {
              console.log('✅ Imagen verificada y recibida:', data.finalUrl);
              window.location.reload(); // ⚠️ fuerza actualización si necesitas refrescar imagenes[promptId]
            }
          })
          .catch(err => {
            console.error('❌ Error en verificación:', err);
            setTimeout(() => retryVerificacion(intentos + 1), 15000);
          });
      };

      retryVerificacion();
    }
  }, [progresoGeneracion, isPending, imagenes, promptId]);

  const aspectRatios = [
    { key: '1:1', label: '1:1' },
    { key: '2:3', label: '2:3' },
    { key: '3:4', label: '3:4' },
    { key: '4:3', label: '4:3' },
    { key: '5:4', label: '5:4' },
    { key: '16:9', label: '16:9' },
    { key: '9:16', label: '9:16' },
    { key: '21:9', label: '21:9' }
  ];

  if (user?.role !== 'admin') return null;

  const handleGenerate = () => {
    const text = inputText.trim();
    if (!text) return alert("Escribe un prompt para generar.");

    handleFluxPrompt({
      promptText: text,
      promptId, // <- clave usada en imágenes, pendientes, etc.
      selectedExtras: [],
      advancedMode: true,
      removeBackground: false,
      seed: undefined,
      useRandomSeed: true,
      ratio: localRatio,
      steps,
      esPublica
    });
  };

  const renderStatus = () => {
    if (isPending) {
      return (
        <>
          <div className="spinner" />
          <p>Pendiente... ({tiempoTranscurrido[promptId] || 0}s)</p>
          {progresoGeneracion[isPending.id]?.colaIndex !== undefined && (
            <p className="keiko-prompt-card__status-detail">
              En cola (#{progresoGeneracion[isPending.id].colaIndex})
            </p>
          )}
          {progresoGeneracion[isPending.id]?.progress !== undefined && (
            <p className="keiko-prompt-card__status-detail">
              Progreso: {progresoGeneracion[isPending.id].progress}%
            </p>
          )}
          <button
            className="keiko-prompt-card__btn keiko-prompt-card__btn--secondary"
            onClick={() => verificarImagen(promptId, isPending.id)}
          >
            Verificar
          </button>
        </>
      );
    }

    if (isGenerating && !imageUrl) {
      return (
        <>
          <div className="spinner" />
          <p>Generando con Flux...</p>
        </>
      );
    }

    return <p className="keiko-prompt-card__image-placeholder-text">🖼️</p>;
  };

  return (
    <div className="keiko-prompt-card keiko-prompt-card--admin">
      <div className="keiko-prompt-card__header">
        <h3>🧪 Prompt Libre (Admin)</h3>
        <span className="keiko-prompt-card__chip">Flux</span>
      </div>

      <div className="keiko-prompt-card__body">
        <div className="keiko-prompt-card__content">
          <textarea
            className="keiko-prompt-card__custom-textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe tu prompt personalizado aquí..."
          />
          <div className="prompt-selector">
            <label htmlFor="prompt-select" className="keiko-label">Selecciona un flujo:</label>
            <select
              id="prompt-select"
              value={promptSeleccionado.id}
              onChange={(e) => {
                const selected = opcionesPrompt.find(opt => opt.id === e.target.value);
                if (selected) setPromptSeleccionado(selected);
              }}
            >
              {opcionesPrompt.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="keiko-prompt-card__options-row">
            <label htmlFor="ratio-select">Proporción:</label>
            <select
              id="ratio-select"
              value={localRatio}
              onChange={(e) => setLocalRatio(e.target.value)}
            >
              {aspectRatios.map((ratio) => (
                <option key={ratio.key} value={ratio.key}>
                  {ratio.label}
                </option>
              ))}
            </select>

            <label htmlFor="steps-select" style={{ marginLeft: '1rem' }}>Pasos:</label>
            <select
              id="steps-select"
              value={steps}
              onChange={(e) => setSteps(parseInt(e.target.value))}
            >
              {[5, 10, 15, 20, 25, 30].map((s) => (
                <option key={s} value={s}>
                  {s} pasos
                </option>
              ))}
            </select>
          </div>

          <div className="public-toggle">
            <label>
              <input
                type="checkbox"
                checked={esPublica}
                onChange={(e) => setEsPublica(e.target.checked)}
              />
              Compartir en galería pública
            </label>
          </div>

          <div className="keiko-prompt-card__actions">
            <button
              className="keiko-prompt-card__btn keiko-prompt-card__btn--primary"
              onClick={handleGenerate}
              disabled={isGenerating || isPending}
            >
              🚀 Generar con Flux
            </button>
          </div>
        </div>

        <div className="keiko-prompt-card__image-status">
          {imageUrl ? (
            <div className="prompt-libre-image-container">
              <img
                src={imageUrl}
                alt="Generación de imagen"
                className="keiko-prompt-card__generated-image"
                onClick={() =>
                  setModalImage({
                    prompt: inputText,
                    finalUrl: imageUrl,
                    url: imageUrl,
                    isAdmin: true,
                    nickname: user?.nickname || 'Admin',
                    packTitle: 'Prompt Libre',
                    createdAt: new Date().toISOString()
                  })
                }
              />
            </div>
          ) : (
            <div className="keiko-prompt-card__image-placeholder">
              <div className="keiko-prompt-card__status-overlay">{renderStatus()}</div>
            </div>
          )}

          {modalImage && <PromptImageModal image={modalImage} onClose={() => setModalImage(null)} />}
        </div>
      </div>
    </div>
  );
};

export default PromptLibreCard;
