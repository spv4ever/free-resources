import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../styles/ImageEditorModal.css';

const INITIAL_ADJUSTMENTS = { brightness: 100, contrast: 100, saturation: 100 };
const MIN_CROP_SIZE = 30;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function getClientPosition(event, rect) {
  const point = 'touches' in event ? event.touches[0] : event;
  return {
    x: point.clientX - rect.left,
    y: point.clientY - rect.top,
  };
}

export default function ImageEditorModal({
  file,
  mode = 'generic',
  onCancel,
  onConfirm,
}) {
  const [imageElement, setImageElement] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [adjustments, setAdjustments] = useState(INITIAL_ADJUSTMENTS);
  const [crop, setCrop] = useState(null);
  const [dragState, setDragState] = useState(null);
  const [colorSample, setColorSample] = useState(null);
  const [colorError, setColorError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const canvasRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setRotation(0);
    setAdjustments(INITIAL_ADJUSTMENTS);
    setCrop(null);
    setColorSample(null);
    setColorError('');

    let isMounted = true;
    loadImage(objectUrl)
      .then((img) => {
        if (isMounted) setImageElement(img);
      })
      .catch(() => {
        if (isMounted) setColorError('No se pudo cargar la imagen seleccionada.');
      });

    return () => {
      isMounted = false;
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const sourceSize = useMemo(() => {
    if (!imageElement) return { width: 0, height: 0 };
    const rotated = rotation % 180 !== 0;
    return rotated
      ? { width: imageElement.height, height: imageElement.width }
      : { width: imageElement.width, height: imageElement.height };
  }, [imageElement, rotation]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame || !imageElement) return;

    const ctx = canvas.getContext('2d');
    const frameWidth = Math.max(frame.clientWidth - 24, 200);
    const frameHeight = Math.max(window.innerHeight * 0.55, 320);
    const ratio = Math.min(frameWidth / sourceSize.width, frameHeight / sourceSize.height, 1);
    const width = Math.max(Math.round(sourceSize.width * ratio), 1);
    const height = Math.max(Math.round(sourceSize.height * ratio), 1);

    canvas.width = width;
    canvas.height = height;
    setViewport({ width, height });

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const drawWidth = imageElement.width * ratio;
    const drawHeight = imageElement.height * ratio;
    ctx.drawImage(imageElement, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }, [adjustments, imageElement, rotation, sourceSize.height, sourceSize.width]);

  useEffect(() => {
    renderCanvas();
    const listener = () => renderCanvas();
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [renderCanvas]);

  useEffect(() => {
    if (!sourceSize.width || !sourceSize.height || crop) return;
    setCrop({
      x: sourceSize.width * 0.1,
      y: sourceSize.height * 0.1,
      width: sourceSize.width * 0.8,
      height: sourceSize.height * 0.8,
    });
  }, [sourceSize, crop]);

  const cropStyle = useMemo(() => {
    if (!crop || !viewport.width || !viewport.height || !sourceSize.width || !sourceSize.height) return {};
    return {
      left: `${(crop.x / sourceSize.width) * viewport.width}px`,
      top: `${(crop.y / sourceSize.height) * viewport.height}px`,
      width: `${(crop.width / sourceSize.width) * viewport.width}px`,
      height: `${(crop.height / sourceSize.height) * viewport.height}px`,
    };
  }, [crop, sourceSize.height, sourceSize.width, viewport.height, viewport.width]);

  const startCropDrag = (event, type) => {
    if (!crop || !frameRef.current) return;
    event.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const position = getClientPosition(event, rect);
    setDragState({ type, startX: position.x, startY: position.y, initialCrop: crop });
  };

  useEffect(() => {
    if (!dragState) return undefined;

    const move = (event) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const currentPosition = getClientPosition(event, rect);
      const dx = ((currentPosition.x - dragState.startX) / viewport.width) * sourceSize.width;
      const dy = ((currentPosition.y - dragState.startY) / viewport.height) * sourceSize.height;
      const initial = dragState.initialCrop;
      let nextCrop = { ...initial };

      if (dragState.type === 'move') {
        nextCrop.x = clamp(initial.x + dx, 0, sourceSize.width - initial.width);
        nextCrop.y = clamp(initial.y + dy, 0, sourceSize.height - initial.height);
      }

      if (dragState.type === 'se') {
        nextCrop.width = clamp(initial.width + dx, MIN_CROP_SIZE, sourceSize.width - initial.x);
        nextCrop.height = clamp(initial.height + dy, MIN_CROP_SIZE, sourceSize.height - initial.y);
      }

      if (dragState.type === 'nw') {
        const maxX = initial.x + initial.width - MIN_CROP_SIZE;
        const maxY = initial.y + initial.height - MIN_CROP_SIZE;
        nextCrop.x = clamp(initial.x + dx, 0, maxX);
        nextCrop.y = clamp(initial.y + dy, 0, maxY);
        nextCrop.width = initial.width + (initial.x - nextCrop.x);
        nextCrop.height = initial.height + (initial.y - nextCrop.y);
      }

      setCrop(nextCrop);
    };

    const stop = () => setDragState(null);

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
  }, [dragState, sourceSize.height, sourceSize.width, viewport.height, viewport.width]);

  const sampleColorFromCanvas = async () => {
    setColorError('');
    if (window.EyeDropper) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        setColorSample(result.sRGBHex);
        return;
      } catch (error) {
        setColorError('No se pudo usar el cuentagotas del sistema. Puedes hacer clic sobre la imagen.');
      }
    }
    setColorError('Haz clic sobre la imagen para detectar el color.');
  };

  const handleCanvasClick = (event) => {
    if (mode !== 'card' || !canvasRef.current || !viewport.width || !viewport.height) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = getClientPosition(event, rect);
    const ctx = canvasRef.current.getContext('2d');
    const pixel = ctx.getImageData(clamp(Math.round(x), 0, viewport.width - 1), clamp(Math.round(y), 0, viewport.height - 1), 1, 1).data;
    const hex = `#${[pixel[0], pixel[1], pixel[2]].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
    setColorSample(hex.toUpperCase());
    setColorError('');
  };

  const exportEditedFile = useCallback(async () => {
    if (!imageElement || !crop) return null;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = Math.max(Math.round(crop.width), 1);
    exportCanvas.height = Math.max(Math.round(crop.height), 1);
    const ctx = exportCanvas.getContext('2d');
    ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
    ctx.translate(exportCanvas.width / 2, exportCanvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const rotated = rotation % 180 !== 0;
    const drawX = rotated ? crop.y : crop.x;
    const drawY = rotated ? imageElement.height - crop.x - crop.width : crop.y;
    const drawWidth = rotated ? crop.height : crop.width;
    const drawHeight = rotated ? crop.width : crop.height;

    ctx.drawImage(
      imageElement,
      drawX,
      drawY,
      drawWidth,
      drawHeight,
      -exportCanvas.width / 2,
      -exportCanvas.height / 2,
      exportCanvas.width,
      exportCanvas.height,
    );

    return new Promise((resolve, reject) => {
      exportCanvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('No se pudo generar la imagen editada.'));
          return;
        }
        const extension = file.type === 'image/png' ? 'png' : 'jpg';
        const outputFile = new File([blob], `${file.name.replace(/\.[^.]+$/, '')}-editado.${extension}`, {
          type: blob.type || file.type || 'image/jpeg',
        });
        resolve(outputFile);
      }, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92);
    });
  }, [adjustments.brightness, adjustments.contrast, adjustments.saturation, crop, file, imageElement, rotation]);

  const handleConfirm = async () => {
    try {
      setIsSaving(true);
      const editedFile = await exportEditedFile();
      await onConfirm({ file: editedFile, detectedColor: colorSample });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="image-editor-modal" role="dialog" aria-modal="true">
      <div className="image-editor-modal__backdrop" onClick={onCancel} />
      <div className="image-editor-modal__panel">
        <div className="image-editor-modal__header">
          <div>
            <p className="image-editor-modal__eyebrow">Preparar imagen antes de Cloudinary</p>
            <h2>{mode === 'card' ? 'Editar tarjeta de color' : 'Editar foto de la bobina'}</h2>
          </div>
          <button type="button" className="image-editor-modal__close" onClick={onCancel}>✕</button>
        </div>

        <div className="image-editor-modal__body">
          <div className="image-editor-modal__workspace">
            <div className="image-editor-modal__frame" ref={frameRef}>
              <canvas ref={canvasRef} onClick={handleCanvasClick} />
              {crop && (
                <div className="image-editor-modal__crop" style={cropStyle} onPointerDown={(event) => startCropDrag(event, 'move')}>
                  <span className="image-editor-modal__handle image-editor-modal__handle--nw" onPointerDown={(event) => startCropDrag(event, 'nw')} />
                  <span className="image-editor-modal__handle image-editor-modal__handle--se" onPointerDown={(event) => startCropDrag(event, 'se')} />
                </div>
              )}
            </div>
            <p className="image-editor-modal__hint">
              {mode === 'card'
                ? 'Arrastra el recorte, gira la tarjeta, ajusta la imagen y haz clic para detectar el color.'
                : 'Arrastra el recorte, gira la foto y ajusta brillo, contraste y saturación antes de subirla.'}
            </p>
          </div>

          <aside className="image-editor-modal__sidebar">
            <div className="image-editor-modal__section">
              <h3>Girar</h3>
              <div className="image-editor-modal__button-row">
                <button type="button" onClick={() => setRotation((current) => (current + 270) % 360)}>↺ -90°</button>
                <button type="button" onClick={() => setRotation((current) => (current + 90) % 360)}>↻ +90°</button>
              </div>
            </div>

            <div className="image-editor-modal__section">
              <h3>Ajustes</h3>
              {[
                ['brightness', 'Brillo'],
                ['contrast', 'Contraste'],
                ['saturation', 'Saturación'],
              ].map(([key, label]) => (
                <label key={key} className="image-editor-modal__range">
                  <span>{label}: {adjustments[key]}%</span>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={adjustments[key]}
                    onChange={(event) => setAdjustments((current) => ({ ...current, [key]: Number(event.target.value) }))}
                  />
                </label>
              ))}
              <button type="button" className="image-editor-modal__ghost" onClick={() => setAdjustments(INITIAL_ADJUSTMENTS)}>Restablecer ajustes</button>
            </div>

            {mode === 'card' && (
              <div className="image-editor-modal__section">
                <h3>Detección de color</h3>
                <button type="button" onClick={sampleColorFromCanvas}>Activar cuentagotas</button>
                <p className="image-editor-modal__color-text">Si el navegador no soporta el cuentagotas, haz clic sobre la imagen.</p>
                {colorSample && (
                  <div className="image-editor-modal__color-preview">
                    <span style={{ backgroundColor: colorSample }} />
                    <strong>{colorSample}</strong>
                  </div>
                )}
                {colorError && <p className="image-editor-modal__error">{colorError}</p>}
              </div>
            )}
          </aside>
        </div>

        <div className="image-editor-modal__footer">
          <button type="button" className="image-editor-modal__ghost" onClick={onCancel}>Cancelar</button>
          <button type="button" className="image-editor-modal__primary" onClick={handleConfirm} disabled={isSaving || !crop}>
            {isSaving ? 'Preparando...' : 'Usar imagen definitiva'}
          </button>
        </div>
      </div>
    </div>
  );
}
