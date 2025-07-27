import React, { useState, useRef } from 'react';
import Select from 'react-select';
import PromptImageModal from './PromptImageModal';
import '../styles/PromptCard.css';
import { useUser } from '../context/UserContext';

// --- ToggleSwitch Component ---
const ToggleSwitch = ({ label, checked, onChange, disabled, isProUser, tooltipText }) => (
  <div
    className={`toggle-switch ${!isProUser || disabled ? 'locked' : ''}`}
    title={tooltipText}
  >
    <label>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled || !isProUser} />
      <span className="slider"></span>
    </label>
    <span>{label}</span>
  </div>
);

const PromptCardRedesigned = React.memo(({
  prompt,
  imagenes,
  pendientes,
  tiempoTranscurrido,
  progresoGeneracion,
  generando,
  selectedExtras,
  setSelectedExtras,
  handleCopyAndOpen,
  copyToClipboard,
  verificarImagen,
  opcionesAuxiliares,
  advancedMode,
  setAdvancedMode,
  removeBackground,
  setRemoveBackground,
  isProUser,
  customText,             // 👈 AÑADE ESTO
  setCustomText,
  imagenPreviewUrl 
}) => {
  const { user } = useUser();

  const [modalImage, setModalImage] = useState(null);

  const promptId = prompt._id;
  const isFlux = prompt.platform.toLowerCase() === 'flux';
  const isGenerating = generando === promptId;
  const isPending = pendientes[promptId];
  const imageUrl = imagenes[promptId];
  const fixedOptionsObj = prompt.fixedOptions instanceof Map ? Object.fromEntries(prompt.fixedOptions) : prompt.fixedOptions || {};

  const advancedTooltipText = !isProUser ? "Función solo para usuarios PRO" : "";
  const proFeatureTooltip = !isProUser ? "Función solo para usuarios PRO" : "";
  const removeBgTooltipText = !isProUser
    ? "Función solo para usuarios PRO"
    : "";
  const inputRef = useRef(null)
  const [showCustomInput, setShowCustomInput] = useState(false);

  const renderStatusContent = () => {
    if (isPending) {
      return (
        <>
          <div className="spinner"></div>
          <p>Pendiente... ({tiempoTranscurrido[promptId] || 0}s)</p>
          {progresoGeneracion[isPending.id]?.colaIndex !== undefined && (
            <p className="keiko-prompt-card__status-detail">En cola (#{progresoGeneracion[isPending.id].colaIndex})</p>
          )}
          {progresoGeneracion[isPending.id]?.progress !== undefined && (
            <p className="keiko-prompt-card__status-detail">Progreso: {progresoGeneracion[isPending.id].progress}%</p>
          )}
          <button className="keiko-prompt-card__btn keiko-prompt-card__btn--secondary" onClick={() => verificarImagen(promptId, isPending)}>
            Verificar
          </button>
        </>
      );
    }
    if (isGenerating && !imageUrl) {
      return (
        <>
          <div className="spinner"></div>
          <p>Generando con Flux...</p>
        </>
      );
    }
    return <p className="keiko-prompt-card__image-placeholder-text">🖼️</p>;
  };

  return (
    <div className="keiko-prompt-card">
      <div className="keiko-prompt-card__header">
        <h3>{prompt.scene}</h3>
        <div className="keiko-prompt-card__meta-tags">
          <span className="keiko-prompt-card__chip">{prompt.platform}</span>
          <span className="keiko-prompt-card__chip">{prompt.access}</span>
          <span className="keiko-prompt-card__chip">{new Date(prompt.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="keiko-prompt-card__body">
        {isFlux && imagenPreviewUrl && (
          <div className="keiko-prompt-card__preview-thumbnail">
            <img
              src={imagenPreviewUrl}
              alt="Imagen generada previamente"
              onClick={() =>
                setModalImage({
                  ...prompt,
                  finalUrl: imagenPreviewUrl,
                  url: imagenPreviewUrl,
                  isAdmin: user?.role === 'admin',
                  nickname: prompt.nickname || 'Autor Desconocido',
                  packTitle: prompt.packTitle || 'Pack Desconocido',
                  createdAt: prompt.createdAt,
                })
              }
            />
            <p className="keiko-prompt-card__preview-label">🖼️ Imagen de ejemplo</p>
            <a
              href={`/keikoprompts/historial/${prompt._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="keiko-prompt-card__btn keiko-prompt-card__btn--secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                padding: '6px 12px',
                marginTop: '0.5rem',
                backgroundColor: '#2e2e2e',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '6px',
                textDecoration: 'none'
              }}
            >
              <span role="img" aria-label="historial">📁</span> Ver historial
            </a>
          </div>
        )}

        <div className="keiko-prompt-card__content">
          <div className="keiko-prompt-card__prompt-text-container">
            <code>{prompt.prompt}</code>
          </div>

          {fixedOptionsObj && Object.keys(fixedOptionsObj).length > 0 && (
            <div className="keiko-prompt-card__prompt-tags">
              {Object.entries(fixedOptionsObj).map(([groupName, options]) => (
                <div key={groupName} className="keiko-prompt-card__tag-group">
                  <span className="keiko-prompt-card__tag-label">{options[0]?.group?.label || groupName}:</span>
                  <span className="keiko-prompt-card__tag-values">{options.map(opt => opt.label).join(', ')}</span>
                </div>
              ))}
            </div>
          )}

          {isFlux && (
            <div className="keiko-prompt-card__generation-options">
              <h4>Opciones Adicionales</h4>
              <div
                className={`react-select-wrapper ${!isProUser ? 'disabled' : ''}`}
                title={proFeatureTooltip}
              >
                <Select
                  options={opcionesAuxiliares}
                  isMulti
                  value={selectedExtras[promptId] || []}
                  onChange={value => setSelectedExtras(prev => ({ ...prev, [promptId]: value }))}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Seleccionar extras..."
                  isDisabled={!isProUser}
                />
              </div>
              <div className="keiko-prompt-card__toggles-container">
                <ToggleSwitch
                  label="Modo Avanzado"
                  checked={advancedMode[promptId] || false}
                  onChange={() => setAdvancedMode(prev => ({ ...prev, [promptId]: !prev[promptId] }))}
                  isProUser={isProUser}
                  tooltipText={advancedTooltipText}
                />
                <ToggleSwitch
                  label="Eliminar Fondo"
                  checked={removeBackground[promptId] || false}
                  onChange={() => setRemoveBackground(prev => ({ ...prev, [promptId]: !prev[promptId] }))}
                  isProUser={isProUser}
                  tooltipText={removeBgTooltipText}
                />
              </div>
            </div>
          )}
          {isFlux && (user?.role === 'admin' || user?.role === 'pro') && showCustomInput && (
            <div className="keiko-prompt-card__custom-text">
              <textarea
                ref={inputRef}
                className="keiko-prompt-card__custom-textarea"
                placeholder="Usar otro texto personalizado..."
                value={customText[promptId] || ''}
                onChange={(e) => setCustomText(prev => ({ ...prev, [promptId]: e.target.value }))}
              />
            </div>
          )}
          {isFlux && (user?.role === 'admin' || user?.role === 'pro') && (
            <button
              className="keiko-prompt-card__btn keiko-prompt-card__btn--secondary"
              onClick={() => setShowCustomInput(prev => !prev)}
              style={{ width: 'fit-content', marginTop: '0.5rem' }}
            >
              ✏️ {showCustomInput ? 'Ocultar Personalización' : 'Personalizar Prompt'}
            </button>
          )}
          <div className="keiko-prompt-card__actions">
            <button
              className="keiko-prompt-card__btn keiko-prompt-card__btn--secondary"
              onClick={() => {
                navigator.clipboard.writeText(prompt.prompt)
                  .then(() => {
                    if (user?.role === 'admin' || user?.role === 'pro') {
                      setCustomText(prev => ({ ...prev, [promptId]: prompt.prompt }));
                      setTimeout(() => {
                        inputRef.current?.focus();
                      }, 100); // pequeño retardo para asegurar renderizado
                    }
                  })
                  .catch(err => {
                    console.error('Error al copiar:', err);
                  });
              }}
            >
              📋 Copiar Prompt
            </button>
            <button
              className="keiko-prompt-card__btn keiko-prompt-card__btn--primary"
              onClick={() => {
                if (isFlux) {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    alert('⚠️ Debes iniciar sesión para generar imágenes en Flux.');
                    return;
                  }
                }
                const promptText = customText[promptId]?.trim() || prompt.prompt;
                handleCopyAndOpen(promptText, prompt.platform, promptId);
              }}
              disabled={isGenerating || isPending}
            >
              🚀 {isFlux ? 'Generar en KeikoAI' : 'Copiar y Abrir IA'}
            </button>
          </div>
        </div>

        <div className="keiko-prompt-card__image-status">
          {isFlux ? (
            imageUrl ? (
              <img
                src={imageUrl}
                alt={`Generación para "${prompt.scene}"`}
                className="keiko-prompt-card__generated-image"
                onClick={() =>
                  setModalImage({
                    ...prompt,
                    finalUrl: imageUrl,
                    url: imageUrl,
                    isAdmin: user?.role === 'admin',
                    nickname: prompt.nickname || 'Autor Desconocido',
                    packTitle: prompt.packTitle || 'Pack Desconocido',
                    createdAt: prompt.createdAt,
                  })
                }
              />
            ) : (
              <div className="keiko-prompt-card__image-placeholder">
                <div className="keiko-prompt-card__status-overlay">{renderStatusContent()}</div>
              </div>
            )
          ) : (
            <div className="keiko-prompt-card__image-placeholder">
              <p className="keiko-prompt-card__image-placeholder-text" style={{ fontSize: '1rem', opacity: 0.5 }}>
                No aplica
              </p>
            </div>
          )}

          {modalImage && <PromptImageModal image={modalImage} onClose={() => setModalImage(null)} />}
        </div>
      </div>
    </div>
  );
});

export default PromptCardRedesigned;
