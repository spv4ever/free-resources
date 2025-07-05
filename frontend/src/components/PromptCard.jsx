import React, { useState } from 'react';  // <--- importar useState
import PromptImageModal from './PromptImageModal'; // ajusta la ruta si hace falta

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
  opcionesAuxiliares,
  advancedMode,
  setAdvancedMode,
  removeBackground,
  setRemoveBackground,
  isProUser
}) => {
  const promptId = prompt._id;
  const fixedOptionsObj = prompt.fixedOptions instanceof Map
    ? Object.fromEntries(prompt.fixedOptions)
    : prompt.fixedOptions;

  const [modalImage, setModalImage] = useState(null);

  return (
    <div className="prompt-card-wrapper" key={promptId}>
      <div className="prompt-row two-column">
        <div className="prompt-content">
          <div className="row-header">
            <h2 className="prompt-scene">{prompt.scene}</h2>
            <pre className="prompt-box">{prompt.prompt}</pre>
            <div className="prompt-actions">
              {prompt.platform.toLowerCase() === 'flux' && (
                imagenes[promptId] ? (
                  <img
                    src={imagenes[promptId]}
                    alt="Imagen generada"
                    className="flux-thumbnail"
                    onClick={() => {
                      setModalImage({
                        ...prompt,
                        finalUrl: imagenes[promptId],
                        url: imagenes[promptId],
                        isAdmin: isProUser, // o alguna lógica que indique si es admin
                        nickname: prompt.nickname || 'Autor Desconocido',
                        packTitle: prompt.packTitle || 'Pack Desconocido',
                        createdAt: prompt.createdAt
                      });
                    }}
                  />
                ) : (
                  <div className="image-placeholder">🖼 Esperando imagen...</div>
                )
              )}
              <button className="copy-btn" onClick={() => copyToClipboard(prompt.prompt)}>📋 Copiar</button>
              <button
                className="open-btn"
                onClick={() => handleCopyAndOpen(prompt.prompt, prompt.platform, promptId)}
                disabled={generando === promptId}
              >
                🚀 {prompt.platform.toLowerCase() === 'flux' ? 'Generar en KeikoIA' : 'Copiar y Abrir IA'}
              </button>
            </div>
          </div>

          {modalImage && (
            <PromptImageModal
              image={modalImage}
              onClose={() => setModalImage(null)}
            />
          )}

          {fixedOptionsObj && (
            <div className="prompt-tags-dark">
              {Object.entries(fixedOptionsObj).map(([groupName, options]) => (
                <div key={groupName} className="prompt-tag-group-dark">
                  <span className="prompt-tag-label">
                    {options[0]?.group?.label || groupName}:
                  </span>{' '}
                  {options.map(opt => opt.label).join(', ')}
                </div>
              ))}
            </div>
          )}

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
              // Aquí mejor eliminar o comentar para evitar duplicar el onClick distinto
              <img
                src={imagenes[promptId]}
                alt="Imagen generada"
                className="flux-thumbnail"
                // onClick={() => window.open(imagenes[promptId], '_blank')}
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
