import React, { useState, useEffect, useRef } from 'react';
import '../styles/KeikoRemoveBG.css'; // Reutiliza estilos

export default function KeikoUpscale() {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [isDragActive, setIsDragActive] = useState(false);
  const [upscaleFactor, setUpscaleFactor] = useState('x2');
  const [originalSize, setOriginalSize] = useState(null);
  const [upscaledSize, setUpscaledSize] = useState(null);
  const [telegramOffer, setTelegramOffer] = useState(null);
  const [imageStatus, setImageStatus] = useState(null);
  const promptIdRef = useRef(null);
  const [telegramConfirm, setTelegramConfirm] = useState(null);


  const MAX_FILE_SIZE_BYTES = 5 * 1000 * 1000;

  const processFile = (f) => {
    setFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setError(null);
    setTimer(0);
    clearInterval(timerRef.current);
    fileInputRef.current && (fileInputRef.current.value = '');
    setPreviewOpen(false);
    setAspectRatio(1);
    setIsDragActive(false);

    if (!f) return setError('No se seleccionó ninguna imagen.');

    if (!f.type.startsWith('image/')) {
      return setError('Formato inválido. Usa una imagen.');
    }

    if (f.size > MAX_FILE_SIZE_BYTES) {
      const mb = (f.size / 1e6).toFixed(2);
      return setError(`Imagen demasiado grande (${mb} MB). Máximo: 5 MB.`);
    }

    setFile(f);
    const preview = URL.createObjectURL(f);
    setOriginalUrl(preview);

    const img = new Image();
    img.src = preview;
    img.onload = () => {
        setAspectRatio(img.width / img.height);         // sigue funcionando igual
        setOriginalSize(`${img.width}×${img.height}`);  // 👈 aquí capturamos el tamaño real
        };
    
  };
  const API_URL = process.env.REACT_APP_API_URL || '';
  const handleUpscale = async () => {
    if (!file) return setError('Selecciona una imagen primero.');
    setLoading(true);
    setError(null);
    setResultUrl(null);
    setTimer(0);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('filename', file.name);
    formData.append('upscaleFactor', upscaleFactor);

    try {
      
      
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/api/upscale`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.status === 413) {
        const data = await res.json();
        if (data.telegramOption) {
        setTelegramOffer({
            message: data.message,
            promptId: data.prompt_id, // o como guardes el prompt ID
            image: file,
            joinUrl: data.telegramJoinUrl
        });
        } else {
        setError(data.message || 'La imagen no pudo procesarse.');
        }
        return;
    }

      const data = await res.json();
      if (res.ok && data?.outputUrl) {
        promptIdRef.current = data.prompt_id; // 👈 si tu backend lo envía
        setResultUrl(data.outputUrl);
        }

      if (res.ok && data?.outputUrl) {
        setResultUrl(data.outputUrl);
      } else {
        setError(data.message || 'No se recibió imagen. Intenta con otra.');
      }
    } catch (err) {
      setError(err.message || 'Error de red o del servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setLoading(false);
    setError(null);
    setTimer(0);
    clearInterval(timerRef.current);
    fileInputRef.current && (fileInputRef.current.value = '');
    setPreviewOpen(false);
    setAspectRatio(1);
    setIsDragActive(false);
  };

  useEffect(() => {
    if (loading) {
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [loading]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const downloadImage = () => {
    if (!resultUrl) return;
    fetch(resultUrl)
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const name = file?.name.split('.').slice(0, -1).join('.') || 'image';
        a.download = `keiko_upscaled_${upscaleFactor}_${name}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert('Error al descargar. Intenta de nuevo.'));
  };


  const handleEnviarATelegram = async (telegramData) => {
    setLoading(true);
    setTelegramOffer(null); // Cierra el popup

    const formData = new FormData();
    formData.append('image', telegramData.image);
    formData.append('prompt_id', telegramData.promptId);

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/to-telegram`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        });

        const data = await res.json();

        if (res.ok && data.success) {
        setResultUrl(null); // No usamos resultUrl
        setImageStatus('enviada_telegram');

        // Muestra instrucciones para ir al canal
        setTelegramConfirm({
            joinUrl: telegramData.joinUrl
            });
        } else {
        setError(data.message || 'Error al enviar a Telegram.');
        }
    } catch (error) {
        setError('Error al contactar con Telegram.');
    } finally {
        setLoading(false);
    }
    };

  return (
    <section className="keiko-remove-bg-container" aria-label="Upscale de imágenes">
      <h1 className="section-title">Upscale - Mejora tus imágenes fácilmente</h1>

      <div className={`file-input-area ${isDragActive ? 'drag-active' : ''}`}
           onDragOver={e => { e.preventDefault(); setIsDragActive(true); }}
           onDragLeave={e => { e.preventDefault(); setIsDragActive(false); }}
           onDrop={e => {
             e.preventDefault();
             setIsDragActive(false);
             if (!loading) processFile(e.dataTransfer.files[0]);
           }}
           aria-roledescription="Zona para arrastrar o seleccionar archivos">
        <div className="file-input-wrapper">
          <button className="btn-primary btn-upload" onClick={() => fileInputRef.current?.click()} disabled={loading}>
            Seleccionar Imagen
          </button>
          <span className="file-name-container" title={file?.name || ''}>
            {file?.name || <span className="placeholder-text">Arrastra una imagen aquí o haz clic para seleccionar</span>}
          </span>
          {file && <button className="btn-clear" onClick={handleClear} disabled={loading}>×</button>}
          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={e => processFile(e.target.files[0])} disabled={loading} />
        </div>
        {isDragActive && !loading && <div className="drop-overlay">Suelta la imagen aquí</div>}
      </div>

      {/* Selector de resolución */}
      <div className="toggle-upscale-wrapper centered-toggle">
        <span className="toggle-label">Resolución:</span>
        <div className="toggle-buttons">
            <button
            type="button"
            className={`toggle-btn ${upscaleFactor === 'x2' ? 'active' : ''}`}
            onClick={() => setUpscaleFactor('x2')}
            disabled={loading}
            >
            x2
            </button>
            <button
            type="button"
            className={`toggle-btn ${upscaleFactor === 'x4' ? 'active' : ''}`}
            onClick={() => setUpscaleFactor('x4')}
            disabled={loading}
            >
            x4
            </button>
        </div>
        </div>

      {error && <p className="error-message">{error}</p>}

      <div className="images-wrapper">
        <figure className="image-slot">
          {originalUrl ? <img src={originalUrl} alt="Imagen original" /> : <div className="placeholder">Imagen original</div>}
          {originalSize && (
            <p className="image-size-label">Tamaño: {originalSize}</p>
            )}
          {loading && <div className="processing-overlay"><div className="spinner" />Cargando...</div>}
        </figure>

        <figure className="image-slot">
          {resultUrl ? (
            <>
              <img
                src={resultUrl}
                alt="Imagen mejorada"
                onClick={() => setPreviewOpen(true)}
                onLoad={(e) => {
                    const img = e.target;
                    setUpscaledSize(`${img.naturalWidth}×${img.naturalHeight}`);
                }}
                style={{ cursor: 'zoom-in' }}
                />
              <figcaption>Imagen Mejorada (clic para ampliar)</figcaption>
              {upscaledSize && (
                <p className="image-size-label">Tamaño: {upscaledSize}</p>
                )}
              <button className="btn-secondary" onClick={downloadImage}>Descargar Imagen</button>
            </>
          ) : (
            <div className="placeholder">Aquí aparecerá la imagen mejorada</div>
          )}
          {loading && <div className="processing-overlay"><div className="spinner" />Procesando...</div>}
        </figure>
      </div>

      <button className="btn-primary sticky-btn" onClick={handleUpscale} disabled={!file || loading}>
        {loading ? `Procesando... ${formatTime(timer)}` : 'Mejorar Imagen'}
      </button>
        {telegramOffer && (
            <div className="modal-overlay" role="dialog" aria-modal="true">
                <div className="modal-content">
                <h2>📦 Imagen demasiado grande</h2>
                <p>{telegramOffer.message}</p>
                <p>¿Quieres recibirla a través de nuestro canal de Telegram?</p>
                <div className="btn-group">
                    <button
                    className="btn-primary"
                    onClick={() => handleEnviarATelegram(telegramOffer)}
                    >
                    Sí, enviarla a Telegram
                    </button>
                    <button
                    className="btn-secondary"
                    onClick={() => setTelegramOffer(null)}
                    >
                    Cancelar
                    </button>
                </div>
                </div>
            </div>
            )}
        {telegramConfirm && (
            <div className="modal-overlay" role="dialog" aria-modal="true">
                <div className="modal-content">
                <h2>✅ Imagen enviada a Telegram</h2>
                <p>Tu imagen se ha enviado correctamente a nuestro canal.</p>
                <p>
                    Puedes unirte al canal y descargarla cuando quieras:<br />
                    <a href={telegramConfirm.joinUrl} target="_blank" rel="noopener noreferrer" className="telegram-link">
                    👉 Ir al canal de Telegram
                    </a>
                </p>
                <button
                    className="btn-primary"
                    onClick={() => setTelegramConfirm(null)}
                    style={{ marginTop: '1rem' }}
                >
                    Cerrar
                </button>
                </div>
            </div>
            )}

      {previewOpen && (
        <div className="modal-overlay" onClick={() => setPreviewOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ aspectRatio, maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={resultUrl} alt="Vista previa mejorada" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px' }} />
            <button className="modal-close-btn" onClick={() => setPreviewOpen(false)}>×</button>
          </div>
        </div>
      )}
    </section>
  );
}
