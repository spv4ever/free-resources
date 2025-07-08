import React, { useState } from 'react';
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
  handleFluxPrompt, // 👈 AÑADIR ESTO,
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
  
  

    const aspectRatios = [
    { key: '1:1', label: '1:1', width: 100, height: 100 },
    { key: '2:3', label: '2:3', width: 66, height: 100 },
    { key: '3:4', label: '3:4', width: 75, height: 100 },
    { key: '4:3', label: '4:3', width: 100, height: 75 },
    { key: '5:4', label: '5:4', width: 100, height: 80 },
    { key: '16:9', label: '16:9', width: 100, height: 56 },
    { key: '9:16', label: '9:16', width: 56, height: 100 },
    { key: '21:9', label: '21:9', width: 100, height: 43 }
    ];

    const [localRatio, setLocalRatio] = useState('1:1');

  if (user?.role !== 'admin') return null;

  const handleGenerate = () => {
    const text = inputText.trim();
    if (!text) return alert("Escribe un prompt para generar.");

    handleFluxPrompt({
        promptText: text,
        promptId,
        selectedExtras: [],
        advancedMode: false,
        removeBackground: false,
        seed: undefined,
        useRandomSeed: true,
        ratio: localRatio,
        steps: 20,
        esPublica              // 👈 AQUÍ SE AÑADE
    });
    };

  const renderStatus = () => {
    if (isPending) {
      return (
        <>
          <div className="spinner" />
          <p>Pendiente... ({tiempoTranscurrido[promptId] || 0}s)</p>
          {progresoGeneracion[isPending.id]?.colaIndex !== undefined && (
            <p className="keiko-prompt-card__status-detail">En cola (#{progresoGeneracion[isPending.id].colaIndex})</p>
          )}
          {progresoGeneracion[isPending.id]?.progress !== undefined && (
            <p className="keiko-prompt-card__status-detail">Progreso: {progresoGeneracion[isPending.id].progress}%</p>
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
            <div className="aspect-ratio-selector">
                <label htmlFor="ratio-select">Proporción:</label>
                <select
                    id="ratio-select"
                    value={localRatio}
                    onChange={(e) => setLocalRatio(e.target.value)}
                >
                    {aspectRatios.map((ratio) => (
                    <option key={ratio.value} value={ratio.value}>
                        {ratio.label}
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
            /></div>
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
