import React, { useState } from 'react';
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
  setCustomText 
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
          {isFlux && user?.role === 'admin' && (
            <div className="keiko-prompt-card__custom-text">
              <input
                type="text"
                placeholder="Usar otro texto personalizado..."
                value={customText[promptId] || ''}
                onChange={(e) => setCustomText(prev => ({ ...prev, [promptId]: e.target.value }))}
              />
            </div>
          )}
          <div className="keiko-prompt-card__actions">
            <button className="keiko-prompt-card__btn keiko-prompt-card__btn--secondary" onClick={() => copyToClipboard(prompt.prompt)}>
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
