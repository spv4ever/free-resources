import React, { useState, useRef, useEffect } from 'react';

export default function ImageFadeCompare({
  originalSrc,
  processedSrc,
  maxWidth = 500
}) {
  const containerRef = useRef(null);
  const [opacity, setOpacity] = useState(0.5);
  const [dimensions, setDimensions] = useState({ width: maxWidth, height: maxWidth });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      let width = maxWidth;
      let height = maxWidth / ratio;
      if (height > maxWidth) {
        height = maxWidth;
        width = maxWidth * ratio;
      }
      setDimensions({ width, height });
    };
    img.src = originalSrc;
  }, [originalSrc, maxWidth]);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = clientX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;
    setOpacity(x / rect.width);
  };

  const onMouseMove = e => handleMove(e.clientX);
  const onTouchMove = e => {
    if (e.touches.length > 0) handleMove(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      style={{
        position: 'relative',
        width: dimensions.width,
        height: dimensions.height,
        userSelect: 'none',
        cursor: 'ew-resize',
        overflow: 'hidden',
      }}
    >
      {/* Imagen procesada (sin fondo) siempre visible */}
      <img
        src={processedSrc}
        alt="Procesada"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          zIndex: 1,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
        draggable={false}
      />

      {/* Imagen original con opacidad variable */}
      <img
        src={originalSrc}
        alt="Original"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          zIndex: 2,
          userSelect: 'none',
          pointerEvents: 'none',
          opacity: 1 - opacity,
          transition: 'opacity 0.1s ease-out',
        }}
        draggable={false}
      />
    </div>
  );
}
