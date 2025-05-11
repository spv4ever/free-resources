import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ImageUploadModal.css';

function ImageUploadModal({ onClose, onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/upload/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const imageUrl = response.data.url;
      onUpload(imageUrl);
      onClose();
    } catch (error) {
      console.error('Error al subir imagen:', error);
      alert('No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <button className="modal-close-button" onClick={onClose}>✖</button>
        <div className="modal-content">
          <h3>Sube una imagen</h3>
          <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
          <div style={{ marginTop: '1rem' }}>
            <button onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Subiendo...' : 'Subir'}
            </button>
            <button onClick={onClose} style={{ marginLeft: '0.5rem' }}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageUploadModal;
