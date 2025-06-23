// PromptCard.jsx
import React from 'react';
import Select from 'react-select';

const PromptCard = React.memo(({
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
  opcionesAuxiliares
}) => {
  const promptId = prompt._id;

  return (
    <div className="prompt-card-wrapper" key={promptId}>
      <div className="prompt-row two-column">
        <div className="prompt-content">
          <div className="row-header">
            <h2 className="prompt-scene">{prompt.scene}</h2>
            <pre className="prompt-box">{prompt.prompt}</pre>
            <div className="prompt-actions">
              {prompt.platform.toLowerCase() === 'flux' && (
                <div className="aux-options">
                  <label>Extras:</label>
                  <Select
                    isMulti
                    options={opcionesAuxiliares}
                    value={selectedExtras[promptId] || []}
                    onChange={(selected) =>
                      setSelectedExtras(prev => ({
                        ...prev,
                        [promptId]: selected
                      }))
                    }
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
              )}
              <button className="copy-btn" onClick={() => copyToClipboard(prompt.prompt)}>📋 Copiar</button>
              <button
                className="open-btn"
                onClick={() => handleCopyAndOpen(prompt.prompt, prompt.platform, promptId)}
                disabled={generando === promptId}
              >
                🚀 {prompt.platform.toLowerCase() === 'flux' ? 'Generar en Flux' : 'Copiar y Abrir IA'}
              </button>
            </div>
          </div>

          

          {pendientes[promptId] && (
            <div className="flux-pending-box">
              <p>
                ⏳ Imagen pendiente de generación…
                {typeof tiempoTranscurrido[promptId] === 'number' && (
                  <span> ({tiempoTranscurrido[promptId]}s)</span>
                )}
                {progresoGeneracion[pendientes[promptId]?.id]?.colaIndex !== undefined && (
                  <span> – 🕓 En cola (#{progresoGeneracion[pendientes[promptId]?.id].colaIndex})</span>
                )}
                {progresoGeneracion[pendientes[promptId]?.id]?.progress !== undefined && (
                  <span> – Progreso: {progresoGeneracion[pendientes[promptId].id].progress} %</span>
                )}
              </p>
              <button onClick={() => verificarImagen(promptId, pendientes[promptId])}>
                🔄 Verificar estado
              </button>
            </div>
          )}

          {generando === promptId && !imagenes[promptId] && !pendientes[promptId] && (
            <p>⏳ Generando imagen con Flux…</p>
          )}

          <div className="row-meta">
            <span className="chip">{prompt.platform}</span>
            <span className="chip">{prompt.access}</span>
            <span className="chip">{new Date(prompt.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="prompt-status-image">
          {prompt.platform.toLowerCase() === 'flux' && (
            imagenes[promptId] ? (
              <img
                src={imagenes[promptId]}
                alt="Imagen generada"
                className="flux-thumbnail"
                onClick={() => window.open(imagenes[promptId], '_blank')}
              />
            ) : (
              <div className="image-placeholder">🖼 Esperando imagen...</div>
            )
          )}
        </div>
      </div>
    </div>
  );
});

export default PromptCard;
