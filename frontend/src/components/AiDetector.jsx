import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AiDetector.css';

const AiDetector = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDetect = async () => {
    if (!text.trim()) return;
  
    setLoading(true);
    setResult(null);
  
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/detect-ai-hf`, { text });
      setResult(res.data); // ✅ El backend ya devuelve el objeto final con result y confidence
    } catch (err) {
      alert('Error al detectar el texto. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };
  

  const getLabelMessage = () => {
    if (!result) return '';
    if (result.label === 'LABEL_0') return 'Texto Humano';
    if (result.label === 'LABEL_1') return 'Texto generado por IA';
    return 'Resultado desconocido';
  };

  return (
    <div className="ai-detector-container">
      <h2>🧠 Detector de Texto IA</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Pega aquí el texto que quieres analizar..."
        rows={10}
      />
      <button onClick={handleDetect} disabled={loading}>
        {loading ? 'Analizando...' : 'Analizar Texto'}
      </button>

      {result && (
        <div className="ai-result-box">
            <p><strong>Resultado:</strong> {result.result}</p>
            <p><strong>Confianza:</strong> {result.confidence}</p>
        </div>
        )}
    </div>
  );
};

export default AiDetector;
