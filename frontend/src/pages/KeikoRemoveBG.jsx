import React, { useState } from 'react';
import '../styles/KeikoRemoveBG.css'; // Asegúrate de crear este archivo CSS

export default function KeikoRemoveBG() {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setOriginalUrl(f ? URL.createObjectURL(f) : null);
    setResultUrl(null);
    setError(null);
  };

  const handleRemoveBackground = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('filename', file.name); // <-- enviamos el nombre original

    try {
      const API_URL = process.env.REACT_APP_API_URL || '';
      const token = localStorage.getItem('token'); // o donde guardes el token

      const res = await fetch(`${API_URL}/api/keiko-remove-bg/remove-bg`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (data?.outputUrl) {
        setResultUrl(data.outputUrl);
      } else {
        setError('No se recibió la imagen sin fondo.');
      }
    } catch (err) {
      setError(err.message || 'Error al procesar la imagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="keiko-remove-bg-container">
      <h1>Quitar Fondo</h1>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      <button onClick={handleRemoveBackground} disabled={!file || loading}>
        {loading ? 'Procesando...' : 'Quitar Fondo'}
      </button>

      {error && <p className="error-message">{error}</p>}

      <div className="images-wrapper">
        <div className="image-slot">
          {originalUrl ? (
            <img src={originalUrl} alt="Original" />
          ) : (
            <div className="placeholder">Aquí aparecerá la imagen original</div>
          )}
        </div>

        <div className="image-slot">
          {resultUrl ? (
            <img src={resultUrl} alt="Sin fondo" />
          ) : (
            <div className="placeholder">Aquí aparecerá la imagen sin fondo</div>
          )}
        </div>
      </div>
    </div>
  );
}
