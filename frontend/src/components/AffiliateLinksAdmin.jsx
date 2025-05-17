import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AffiliateLinksAdmin.css';

const AffiliateLinksAdmin = () => {
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const fetchLinks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/affiliate-links/admin`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setLinks(res.data);
    } catch (err) {
      console.error('Error al cargar enlaces de afiliado:', err);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...links];
    updated[index][field] = value;
    setLinks(updated);
  };

  const handleSave = async (index) => {
    const link = links[index];
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/api/affiliate-links/${link._id}`, link, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEditIndex(null);
      fetchLinks();
    } catch (err) {
      console.error('Error al guardar cambios:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este enlace?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/affiliate-links/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchLinks();
    } catch (err) {
      console.error('Error al eliminar enlace:', err);
    }
  };

  const handleAddNew = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/affiliate-links`, newLink, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNewLink(null);
      fetchLinks();
    } catch (err) {
      console.error('Error al crear nuevo enlace:', err);
    }
  };

  return (
    
    <div className="ai-admin-container">
      <h2 className="ai-admin-title">🔗 Gestión de Enlaces de Afiliados</h2>
      <button className="ai-admin-reset" onClick={() => {
            Object.keys(sessionStorage).forEach(key => {
                if (key.startsWith('shown-popup-')) {
                sessionStorage.removeItem(key);
                }
            });
            alert('Popups reseteados para esta sesión.');
            }}>
            🧹 Limpiar popups mostrados
            </button>

      <button className="ai-admin-add" onClick={() => setNewLink({
        title: '', cta: '', url: '', imageUrl: '', category: '', location: 'popup', page: '', priority: 1, isActive: true
      })}>➕ Añadir enlace</button>

      <table className="ai-admin-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>CTA</th>
            <th>URL</th>
            <th>Imagen</th>
            <th>Categoría</th>
            <th>Ubicación</th>
            <th>Página</th>
            <th>Orden</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link, index) => (
            <tr key={link._id}>
              <td>
                {editIndex === index ? (
                  <input value={link.title} onChange={e => handleChange(index, 'title', e.target.value)} />
                ) : link.title}
              </td>
              <td>
                {editIndex === index ? (
                  <input value={link.cta} onChange={e => handleChange(index, 'cta', e.target.value)} />
                ) : link.cta}
              </td>
              <td>
                {editIndex === index ? (
                  <input value={link.url} onChange={e => handleChange(index, 'url', e.target.value)} />
                ) : link.url}
              </td>
              <td>
                {editIndex === index ? (
                  <input value={link.imageUrl} onChange={e => handleChange(index, 'imageUrl', e.target.value)} />
                ) : (
                  <img src={link.imageUrl} alt="preview" style={{ width: '40px', height: 'auto' }} />
                )}
              </td>
              <td>
                {editIndex === index ? (
                  <input value={link.category} onChange={e => handleChange(index, 'category', e.target.value)} />
                ) : link.category}
              </td>
              <td>
                {editIndex === index ? (
                  <select value={link.location} onChange={e => handleChange(index, 'location', e.target.value)}>
                    <option value="popup">Popup</option>
                    <option value="banner">Banner</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="footer">Footer</option>
                  </select>
                ) : link.location}
              </td>
              <td>
                {editIndex === index ? (
                  <input value={link.page} onChange={e => handleChange(index, 'page', e.target.value)} />
                ) : link.page}
              </td>
              <td>
                {editIndex === index ? (
                  <input type="number" value={link.priority} onChange={e => handleChange(index, 'priority', e.target.value)} />
                ) : link.priority}
              </td>
              <td>
                {editIndex === index ? (
                  <input type="checkbox" checked={link.isActive} onChange={e => handleChange(index, 'isActive', e.target.checked)} />
                ) : (link.isActive ? '✅' : '❌')}
              </td>
              <td>
                {editIndex === index ? (
                  <>
                    <button onClick={() => handleSave(index)}>💾</button>
                    <button onClick={() => setEditIndex(null)}>❌</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditIndex(index)}>✏️</button>
                    <button onClick={() => handleDelete(link._id)}>🗑️</button>
                  </>
                )}
              </td>
            </tr>
          ))}

          {newLink && (
            <tr className="new-row">
              <td><input value={newLink.title} onChange={e => setNewLink({ ...newLink, title: e.target.value })} /></td>
              <td><input value={newLink.cta} onChange={e => setNewLink({ ...newLink, cta: e.target.value })} /></td>
              <td><input value={newLink.url} onChange={e => setNewLink({ ...newLink, url: e.target.value })} /></td>
              <td><input value={newLink.imageUrl} onChange={e => setNewLink({ ...newLink, imageUrl: e.target.value })} /></td>
              <td><input value={newLink.category} onChange={e => setNewLink({ ...newLink, category: e.target.value })} /></td>
              <td>
                <select value={newLink.location} onChange={e => setNewLink({ ...newLink, location: e.target.value })}>
                  <option value="popup">Popup</option>
                  <option value="banner">Banner</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="footer">Footer</option>
                </select>
              </td>
              <td><input value={newLink.page} onChange={e => setNewLink({ ...newLink, page: e.target.value })} /></td>
              <td><input type="number" value={newLink.priority} onChange={e => setNewLink({ ...newLink, priority: e.target.value })} /></td>
              <td>
                <input type="checkbox" checked={newLink.isActive} onChange={e => setNewLink({ ...newLink, isActive: e.target.checked })} />
              </td>
              <td>
                <button onClick={handleAddNew}>✅</button>
                <button onClick={() => setNewLink(null)}>❌</button>
              </td>
            </tr>
          )}

        </tbody>
      </table>
    </div>
  );
};

export default AffiliateLinksAdmin;