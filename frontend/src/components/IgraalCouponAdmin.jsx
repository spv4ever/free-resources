import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/IgraalCouponAdmin.css'; // Reutiliza el estilo base de administración

function IgraalCouponAdmin() {
  const [cupones, setCupones] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/igraal-coupons/pending`);
        setCupones(res.data);
      } catch (err) {
        console.error('Error al cargar cupones pendientes:', err);
      }
    };
    fetchPending();
  }, []);

  const isValidUrl = (url) => {
    if (!url) return true; // se permite vacío
    try {
        new URL(url); // usa la API nativa del navegador
        return true;
    } catch {
        return false;
    }
    };

  const handleUpload = async () => {
    if (!imageFile) return;
    setLoading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/igraal-coupons/upload`, formData);
      setCupones(prev => [...res.data.coupons, ...prev]);
      setMessage(res.data.message);
      setImageFile(null);
    } catch (err) {
      setMessage('❌ Error al subir o analizar la imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (id, field, value) => {
    setCupones(prev =>
      prev.map(c => c._id === id ? { ...c, [field]: value } : c)
    );
  };

  const handleAccept = async (c) => {
    if (!isValidUrl(c.sourceUrl)) {
        alert('⚠️ La URL oficial proporcionada no es válida.');
        return;
    }

    try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/igraal-coupons/${c._id}/accept`, {
        title: c.title,
        description: c.description,
        code: c.code,
        url: c.url,
        sourceUrl: c.sourceUrl || null
        });
        setCupones(prev => prev.filter(p => p._id !== c._id));
    } catch {
        alert('Error al aceptar cupón');
    }
    };

  const handleReject = async (c) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/igraal-coupons/${c._id}/reject`);
      setCupones(prev => prev.filter(p => p._id !== c._id));
    } catch {
      alert('Error al rechazar cupón');
    }
  };

  return (
    <div className="ai-admin-container">
      <h2 className="ai-admin-title">🧾 Cupones pendientes de Igraal</h2>

      <div className="ai-admin-upload">
        <input type="file" onChange={(e) => setImageFile(e.target.files[0])} />
        <button onClick={handleUpload} disabled={loading || !imageFile}>
          {loading ? 'Procesando...' : 'Subir imagen'}
        </button>
        {message && <span className="ai-admin-message">{message}</span>}
      </div>

      <table className="ai-admin-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Título</th>
            <th>Descripción</th>
            <th>Código</th>
            <th>Web oficial</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cupones.map((c) => (
            <tr key={c._id}>
              <td><a href={c.imageUrl} target="_blank" rel="noreferrer">Ver</a></td>
              <td><input value={c.title || ''} onChange={(e) => handleFieldChange(c._id, 'title', e.target.value)} /></td>
              <td><textarea value={c.description || ''} onChange={(e) => handleFieldChange(c._id, 'description', e.target.value)} /></td>
              <td><input value={c.code || ''} onChange={(e) => handleFieldChange(c._id, 'code', e.target.value)} /></td>
              <td>
                <input
                    value={c.sourceUrl || ''}
                    onChange={(e) => handleFieldChange(c._id, 'sourceUrl', e.target.value)}
                />
                </td>


              <td>
                <button onClick={() => handleAccept(c)}>✅</button>
                <button onClick={() => handleReject(c)}>❌</button>
              </td>
            </tr>
          ))}
          {cupones.length === 0 && (
            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No hay cupones pendientes.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default IgraalCouponAdmin;
