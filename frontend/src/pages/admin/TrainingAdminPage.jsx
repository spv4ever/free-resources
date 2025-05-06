import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/TrainingAdminPage.css';

function TrainingAdminPage() {
  const [resources, setResources] = useState([]);
  const [editData, setEditData] = useState(null);
  const [newData, setNewData] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/training-resources`);
      setResources(res.data);
    } catch (err) {
      console.error('Error al cargar recursos:', err);
    }
  };

  const handleChange = (e, dataSetter) => {
    const { name, value, type, checked } = e.target;
    dataSetter(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/training-resources`, newData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setNewData(null);
      fetchResources();
    } catch (err) {
      console.error('Error al crear recurso:', err);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/training-resources/${editData._id}`, editData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setEditData(null);
      fetchResources();
    } catch (err) {
      console.error('Error al actualizar recurso:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este recurso?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/training-resources/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchResources();
    } catch (err) {
      console.error('Error al eliminar recurso:', err);
    }
  };

  return (
    <div className="admin-page">
      <h2>Gestión de Recursos de Formación</h2>

      <button className="add-button" onClick={() => setNewData({
        titulo: '',
        descripcion: '',
        categoria: '',
        tipo: '',
        plataforma: '',
        url: '',
        duracion: '',
        dificultad: '',
        idioma: '',
        gratuito: true,
        precio: '',
        certificado: false,
        destacado: false
        })}>
        ➕ Añadir recurso
        </button>

        {newData && (
        <div className="admin-form">
            {Object.entries(newData).map(([key, value]) => (
            key !== '_id' && (
                <label key={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}:
                {typeof value === 'boolean' ? (
                    <input
                    type="checkbox"
                    name={key}
                    checked={value}
                    onChange={(e) => handleChange(e, setNewData)}
                    />
                ) : (
                    <input
                    type="text"
                    name={key}
                    value={value}
                    onChange={(e) => handleChange(e, setNewData)}
                    />
                )}
                </label>
            )
            ))}
            <div className="form-buttons">
            <button onClick={handleCreate}>💾 Guardar</button>
            <button onClick={() => setNewData(null)}>✖ Cancelar</button>
            </div>
        </div>
        )}

        <div className="admin-table">
        {resources.map(resource => (
            <div key={resource._id} className="admin-row">
            {editData?._id === resource._id ? (
                <>
                {Object.entries(editData).map(([key, value]) => (
                    key !== '_id' && (
                    <label key={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}:
                        {typeof value === 'boolean' ? (
                        <input
                            type="checkbox"
                            name={key}
                            checked={value}
                            onChange={(e) => handleChange(e, setEditData)}
                        />
                        ) : (
                        <input
                            type="text"
                            name={key}
                            value={value}
                            onChange={(e) => handleChange(e, setEditData)}
                        />
                        )}
                    </label>
                    )
                ))}
                <div className="form-buttons">
                    <button onClick={handleUpdate}>💾</button>
                    <button onClick={() => setEditData(null)}>✖</button>
                </div>
                </>
            ) : (
                <>
                <strong>{resource.titulo}</strong>
                <p className="meta">{resource.tipo} · {resource.plataforma}</p>
                <p className="descripcion">{resource.descripcion}</p>
                <div className="row-actions">
                    <button onClick={() => setEditData(resource)}>✏</button>
                    <button onClick={() => handleDelete(resource._id)}>🗑</button>
                </div>
                </>
            )}
            </div>
        ))}
        </div>

    </div>
  );
}

export default TrainingAdminPage;
