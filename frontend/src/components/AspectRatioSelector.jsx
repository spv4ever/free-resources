import React from 'react';
import '../styles/AspectRatioSelector.css';

const ratios = [
  { key: '1:1', label: '1:1', width: 100, height: 100 },
  { key: '2:3', label: '2:3', width: 66, height: 100 },
  { key: '3:4', label: '3:4', width: 75, height: 100 },
  { key: '4:3', label: '4:3', width: 100, height: 75 },
  { key: '5:4', label: '5:4', width: 100, height: 80 },
  { key: '16:9', label: '16:9', width: 100, height: 56 },
  { key: '9:16', label: '9:16', width: 56, height: 100 },
  { key: '21:9', label: '21:9', width: 100, height: 43 },
];

export default function AspectRatioSelector({ selected, onChange }) {
  return (
    <div className="aspect-ratio-grid">
      {ratios.map(ratio => (
        <button
          key={ratio.key}
          data-label={`Proporción ${ratio.label}`}
          className={`aspect-button ${selected === ratio.key ? 'active' : ''}`}
          onClick={() => onChange(ratio.key)}
        >
          <div
            className="aspect-preview"
            style={{
              width: `${ratio.width}px`,
              height: `${ratio.height}px`,
            }}
          ></div>
          <span>{ratio.label}</span>
        </button>
      ))}
    </div>
  );
}
