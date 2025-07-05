import { useState } from 'react';

export default function ImageHoverCompare({ originalSrc, processedSrc, alt = 'Comparativa' }) {
  const [hovered, setHovered] = useState(false);

  return (
    <img
      src={hovered ? processedSrc : originalSrc}
      alt={alt}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ maxWidth: '100%', cursor: 'pointer' }}
    />
  );
}
