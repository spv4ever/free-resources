import React from 'react';
import Select from 'react-select';
import '../styles/PromptCard.css'; // Asegúrate que la ruta sea correcta

// --- Componentes de Iconos y UI (auto-contenidos) ---
const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zM-1 7.5A.5.5 0 0 1 0 8v6a.5.5 0 0 1-1 0V8a.5.5 0 0 1 .5-.5z"/></svg>
);
const RocketIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8.811 1.576a.5.5 0 0 0-.622 0l-1.83.915a.5.5 0 0 0-.248.447v3.528l-1.122 2.244a.5.5 0 0 0 .196.67l1.723 1.034a.5.5 0 0 0 .622 0l4.334-2.599a.5.5 0 0 0 0-.868L8.811 1.576zM8 12.031l-1.74-.937L7.61 8.243l1.139.683.02 3.105zM14.5 6.132a.5.5 0 0 1 .196.67l-1.122 2.244v3.528a.5.5 0 0 1-.248.447l-1.83.915a.5.5 0 0 1-.622 0l-4.334-2.599a.5.5 0 0 1 0-.868l4.334-2.599a.5.5 0 0 1 .622 0l1.83.915z"/></svg>
);
const SpinnerIcon = () => (
    <div className="spinner"></div>
);
// --- Toggle Switch Component ---
// Añadimos la prop 'tooltipText'
const ToggleSwitch = ({ label, checked, onChange, disabled, isProUser, tooltipText }) => (
  <div
    className={`toggle-switch ${!isProUser || disabled ? 'locked' : ''}`}
    title={tooltipText} // <-- Aquí se aplica el tooltip
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
  isProUser
}) => {
  const promptId = prompt._id;
  const isFlux = prompt.platform.toLowerCase() === 'flux';
  const isGenerating = generando === promptId;
  const isPending = pendientes[promptId];
  const imageUrl = imagenes[promptId];
  const fixedOptionsObj = prompt.fixedOptions instanceof Map ? Object.fromEntries(prompt.fixedOptions) : prompt.fixedOptions;

  const advancedTooltipText = !isProUser ? "Función solo para usuarios PRO" : "";

  const proFeatureTooltip = !isProUser ? "Función solo para usuarios PRO" : "";

  const removeBgTooltipText = !isProUser 
    ? "Función solo para usuarios PRO" 
    : !(advancedMode[promptId] || false) 
      ? "Debes activar el 'Modo Avanzado' primero" 
      : "";

  const renderStatusContent = () => {
    if (isPending) {
      return (
        <>
          <SpinnerIcon />
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
        return <><SpinnerIcon /><p>Generando con Flux...</p></>;
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
                  onChange={value => setSelectedExtras(prev => ({...prev, [promptId]: value}))}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Seleccionar extras..."
                  isDisabled={!isProUser} // <-- Mantenemos el isDisabled para la funcionalidad
                />
              </div>
              <div className="keiko-prompt-card__toggles-container">
                <ToggleSwitch label="Modo Avanzado" checked={advancedMode[promptId] || false} onChange={() => setAdvancedMode(prev => ({...prev, [promptId]: !prev[promptId]}))} isProUser={isProUser} tooltipText={advancedTooltipText}/>
                <ToggleSwitch label="Eliminar Fondo" checked={removeBackground[promptId] || false} onChange={() => setRemoveBackground(prev => ({...prev, [promptId]: !prev[promptId]}))} disabled={!(advancedMode[promptId] || false)} isProUser={isProUser} tooltipText={removeBgTooltipText}/>
              </div>
            </div>
          )}
          
          <div className="keiko-prompt-card__actions">
            <button className="keiko-prompt-card__btn keiko-prompt-card__btn--secondary" onClick={() => copyToClipboard(prompt.prompt)}>
              <CopyIcon /> Copiar Prompt
            </button>
            <button
              className="keiko-prompt-card__btn keiko-prompt-card__btn--primary"
              onClick={() => {
                if (prompt.platform.toLowerCase() === 'flux') {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    alert('⚠️ Debes iniciar sesión para generar imágenes en Flux.');
                    return;
                  }
                }
                handleCopyAndOpen(prompt.prompt, prompt.platform, promptId);
              }}
              disabled={isGenerating || isPending}
            >
              <RocketIcon /> {isFlux ? 'Generar en Flux' : 'Copiar y Abrir IA'}
            </button>
          </div>
        </div>

        <div className="keiko-prompt-card__image-status">
          {isFlux ? (
            imageUrl ? (
              <img src={imageUrl} alt={`Generación para "${prompt.scene}"`} className="keiko-prompt-card__generated-image" onClick={() => window.open(imageUrl, '_blank')} />
            ) : (
              <div className="keiko-prompt-card__image-placeholder">
                <div className="keiko-prompt-card__status-overlay">{renderStatusContent()}</div>
              </div>
            )
          ) : (
            <div className="keiko-prompt-card__image-placeholder">
              <p className="keiko-prompt-card__image-placeholder-text" style={{fontSize: '1rem', opacity: 0.5}}>No aplica</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default PromptCardRedesigned;