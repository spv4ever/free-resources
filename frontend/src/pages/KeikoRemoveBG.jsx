import React, { useState, useEffect, useRef } from 'react';
import '../styles/KeikoRemoveBG.css';

export default function KeikoRemoveBG() {
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

  // Definir el tamaño máximo permitido en bytes (5 MB)
  const MAX_FILE_SIZE_BYTES = 5 * 1000 * 1000; // 5,000,000 bytes (5 MB)

  // Función unificada para procesar el archivo seleccionado/soltado
  const processFile = (f) => {
    // *** Importante: Limpiar el estado previo al intentar cargar un nuevo archivo ***
    setFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setError(null);
    setTimer(0);
    clearInterval(timerRef.current);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Limpiar el input de tipo file
    }
    setPreviewOpen(false);
    setAspectRatio(1);
    setIsDragActive(false);

    // 1. Validar si hay un archivo
    if (!f) {
      setError('No se seleccionó ninguna imagen. Por favor, intenta de nuevo.');
      return; // Detiene la ejecución si no hay archivo
    }

    // 2. Validar tipo de archivo (que sea imagen)
    if (!f.type.startsWith('image/')) {
      setError('Formato de archivo no válido. Por favor, selecciona una imagen (JPG, PNG, WebP, etc.).');
      return; // Detiene la ejecución si el tipo no es válido
    }

    // 3. Validar tamaño de archivo
    if (f.size > MAX_FILE_SIZE_BYTES) {
      const userFileSizeMB = (f.size / (1000 * 1000)).toFixed(2); // Convertir a MB con 2 decimales
      const maxSizeMB = (MAX_FILE_SIZE_BYTES / (1000 * 1000)); // Esto seguirá siendo 5 para 5MB

      setError(`Tu imagen (${userFileSizeMB} MB) es demasiado grande. El tamaño máximo permitido es de ${maxSizeMB} MB.`);
      return; // Detiene la ejecución si el tamaño excede
    }

    // Si todas las validaciones pasan, proceder con la carga y visualización
    setFile(f);
    setOriginalUrl(URL.createObjectURL(f));
    const img = new Image();
    img.src = URL.createObjectURL(f);
    img.onload = () => {
      setAspectRatio(img.width / img.height);
    };
    // No es necesario llamar a setError(null) aquí, ya se hizo al principio
  };

  const handleFileChange = (e) => {
    const f = e.target.files ? e.target.files[0] : null;
    processFile(f);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  // handleClear ahora es solo para el botón "Limpiar" o para casos de reset completo
  const handleClear = () => {
    setFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setLoading(false);
    setError(null);
    setTimer(0);
    clearInterval(timerRef.current);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPreviewOpen(false);
    setAspectRatio(1);
    setIsDragActive(false);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (!loading) {
      const droppedFile = e.dataTransfer.files[0];
      processFile(droppedFile);
    }
  };

  // Efecto para el temporizador de carga
  useEffect(() => {
    if (loading) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [loading]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleRemoveBackground = async () => {
    if (!file) {
      setError('Por favor, selecciona una imagen primero para quitarle el fondo.');
      return;
    }
    setLoading(true);
    setError(null);
    setResultUrl(null);
    setTimer(0);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('filename', file.name);

    try {
      const API_URL = process.env.REACT_APP_API_URL || '';
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/api/keiko-remove-bg/remove-bg`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data?.outputUrl) {
        setResultUrl(data.outputUrl);
      } else {
        setError(data.message || 'No se recibió la imagen sin fondo. Intenta con otra imagen o revisa el tamaño/formato.');
      }
    } catch (err) {
      setError(err.message || 'Error al procesar la imagen. Verifica tu conexión a internet o intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!resultUrl) return;
    fetch(resultUrl)
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const originalFileName = file?.name.split('.').slice(0, -1).join('.') || 'image';
        a.download = `keiko_no_bg_${originalFileName}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert('Error al descargar la imagen. Por favor, intenta de nuevo.'));
  };

  return (
    <section className="keiko-remove-bg-container" aria-label="Sección para quitar fondo de imágenes">
      <h1 className="section-title">Remove Background - Elimina el fondo de tus imágenes con un solo clic</h1>

      <div
        className={`file-input-area ${isDragActive ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-roledescription="Zona para arrastrar o seleccionar archivos de imagen"
      >
        <div className="file-input-wrapper">
          <button
            type="button"
            className="btn-primary btn-upload"
            onClick={handleFileClick}
            disabled={loading}
            aria-label="Seleccionar archivo de imagen"
          >
            Seleccionar Imagen
          </button>
          <span className="file-name-container" title={file?.name || ''}>
            {file?.name ? (
              <span className="actual-file-name">{file.name}</span>
            ) : (
              <span className="placeholder-text">Arrastra una imagen aquí o haz clic para seleccionar</span>
            )}
          </span>
          {file && (
            <button
              type="button"
              className="btn-clear"
              onClick={handleClear}
              disabled={loading}
              aria-label="Limpiar imagen seleccionada y resultados"
              title="Limpiar imagen"
            >
              ×
            </button>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={loading}
            style={{ display: 'none' }}
            aria-hidden="true"
          />
        </div>
        {isDragActive && !loading && (
          <div className="drop-overlay" aria-hidden="true">
            Suelta la imagen aquí
          </div>
        )}
      </div>

      {error && <p className="error-message" role="alert">{error}</p>}

      <div className="images-wrapper">
        <figure className="image-slot">
          {originalUrl ? (
            <>
              <img src={originalUrl} alt="Imagen original seleccionada" />
              <figcaption>Imagen Original</figcaption>
            </>
          ) : (
            <div className="placeholder">Aquí aparecerá la imagen original</div>
          )}
          {loading && (
            <div className="processing-overlay">
              <div className="spinner" aria-label="Cargando imagen original"></div>
              <span>Cargando imagen...</span>
            </div>
          )}
        </figure>

        <figure className="image-slot">
          {resultUrl ? (
            <>
              <img
                src={resultUrl}
                alt="Imagen sin fondo procesada"
                onClick={() => setPreviewOpen(true)}
                style={{ cursor: 'zoom-in' }}
              />
              <figcaption>Imagen sin Fondo (clic para ampliar)</figcaption>
              <button
                className="btn-secondary"
                onClick={downloadImage}
                aria-label="Descargar imagen sin fondo"
              >
                Descargar Imagen
              </button>
            </>
          ) : (
            <div className="placeholder">Aquí aparecerá la imagen sin fondo</div>
          )}
          {loading && (
            <div className="processing-overlay">
              <div className="spinner" aria-label="Procesando imagen"></div>
              <span>Procesando imagen...</span>
            </div>
          )}
        </figure>
      </div>

      <button
        className="btn-primary sticky-btn"
        onClick={handleRemoveBackground}
        disabled={!file || loading}
        aria-busy={loading}
      >
        {loading ? `Procesando... ${formatTime(timer)}` : 'Quitar Fondo'}
      </button>

      {previewOpen && (
        <div
          className="modal-overlay"
          onClick={() => setPreviewOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Vista previa de la imagen sin fondo"
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              aspectRatio: aspectRatio,
              maxWidth: '90vw',
              maxHeight: '90vh',
              width: 'auto',
              height: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src={resultUrl}
              alt="Imagen sin fondo ampliada"
              style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px' }}
            />
            <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPreviewOpen(false)}
                aria-label="Cerrar vista previa"
            >
                ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
}