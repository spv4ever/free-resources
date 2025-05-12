import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/SocialPostAdmin.css';
import { useUser } from '../context/UserContext';

function SocialPostAdmin() {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [refType, setRefType] = useState('aiTool');
  const [resources, setResources] = useState([]);
  const [selectedRefId, setSelectedRefId] = useState('');

  const [successMessage, setSuccessMessage] = useState('');

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/social-posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error('Error al cargar posts:', err);
      setError('No se pudo cargar la lista de posts.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResourcesByType = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'aiTool'
        ? '/api/aitools'
        : '/api/scam-posts';
      const res = await axios.get(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResources(res.data);
      setSelectedRefId(res.data[0]?._id || '');
    } catch (err) {
      console.error('Error al cargar recursos:', err);
    }
  };

  const handleGeneratePost = async () => {
    if (!selectedRefId) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/social-posts/generate`, {
        refType,
        refId: selectedRefId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowForm(false);
      fetchPosts();
    } catch (err) {
      console.error('Error al generar post:', err);
      alert('Error al generar el post.');
    }
  };
  const handleDeleteDescartados = async () => {
    if (!window.confirm('¿Estás seguro de eliminar todos los posts descartados?')) return;
  
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${process.env.REACT_APP_API_URL}/api/social-posts/descartados`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setSuccessMessage(`🗑️ ${res.data.deletedCount} post(s) descartados eliminados.`);
      setTimeout(() => setSuccessMessage(''), 3000); // se borra a los 3s
  
      fetchPosts();
    } catch (err) {
      console.error('Error al eliminar posts descartados:', err);
      alert('Error al eliminar los posts descartados.');
    }
  };
  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/api/social-posts/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (showForm) {
      fetchResourcesByType(refType);
    }
  }, [refType, showForm]);

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="social-admin-container">
      <h2 className="social-admin-title">📝 Generador de Posts para Redes</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button className="social-admin-add" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '➕ Añadir nuevo post'}
        </button>
        <button className="social-admin-add" style={{ backgroundColor: '#dc3545' }} onClick={handleDeleteDescartados}>
            🗑️ Eliminar descartados
        </button>
        </div>

      {showForm && (
        <div className="social-admin-form">
          <div className="social-admin-row">
            <label>Tipo de recurso:</label>
            <select value={refType} onChange={(e) => setRefType(e.target.value)}>
              <option value="aiTool">Herramienta IA</option>
              <option value="cyberScamPost">Post de Estafa</option>
            </select>
          </div>

          <div className="social-admin-row">
            <label>Recurso:</label>
            <select value={selectedRefId} onChange={(e) => setSelectedRefId(e.target.value)}>
              {resources.map((r) => (
                <option key={r._id} value={r._id}>
                  {refType === 'aiTool' ? r.herramientaAI : r.titulo}
                </option>
              ))}
            </select>
          </div>

          <div className="social-admin-actions">
            <button className="generate" onClick={handleGeneratePost}>Generar post</button>
            <button className="cancel" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && (
        <div className="social-admin-success">{successMessage}</div>
        )}
      {posts.length === 0 ? (
        <p>No hay posts generados aún.</p>
      ) : (
        <table className="social-admin-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Texto generado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post._id}>
                <td>{new Date(post.createdAt).toLocaleDateString('es-ES')}</td>
                <td>{post.refType}</td>
                <td>{post.status}</td>
                <td>
                  <textarea readOnly value={post.generatedText} />
                </td>
                <td>
                  <button onClick={() => navigator.clipboard.writeText(post.generatedText)}>📋</button>
                  <button onClick={() => handleStatusChange(post._id, 'publicado')}>✅</button>
                  <button onClick={() => handleStatusChange(post._id, 'descartado')}>❌</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SocialPostAdmin;
