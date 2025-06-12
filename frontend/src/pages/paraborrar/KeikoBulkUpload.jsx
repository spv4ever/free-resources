// src/admin/keikoprompts/KeikoBulkUpload.jsx
import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/KeikoAdmin.css';

const KeikoBulkUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const token = localStorage.getItem('token');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setUploading(true);
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/keiko/import`, json, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        setResult({ success: true, message: res.data.message });
      } catch (err) {
        console.error('Error al subir JSON:', err);
        setResult({ success: false, message: err.response?.data?.error || 'Error desconocido' });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="keiko-admin-wrapper">
      <h2>📥 Carga Masiva de Prompts (JSON)</h2>

      <div className="keiko-admin-form">
        <input type="file" accept=".json" onChange={handleFileChange} />
        <button type="button" onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? 'Subiendo...' : '📤 Subir JSON'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '1rem', color: result.success ? 'lightgreen' : '#ff6b6b' }}>
          {result.message}
        </div>
      )}
    </div>
  );
};

export default KeikoBulkUpload;
