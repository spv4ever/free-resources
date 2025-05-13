import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/ShortCategoriesPage.css';

function ShortCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ nombre: '', keywords: '', subcategoria: 'Otro', imageUrl: '' });
  const [editCategory, setEditCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const subcategoriasDisponibles = ['Humor', 'Tutorial', 'Review', 'Otro'];

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/short-categories`);
      setCategories(res.data);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadViaBackend = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload/image`, formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.url;
  };

  const handleAdd = async () => {
    if (!newCategory.nombre.trim()) return;
    try {
      const payload = { ...newCategory };
      await axios.post(`${process.env.REACT_APP_API_URL}/api/short-categories`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setNewCategory({ nombre: '', keywords: '', subcategoria: 'Otro', imageUrl: '' });
      fetchCategories();
    } catch (err) {
      console.error('Error al crear categoría:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/short-categories/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchCategories();
    } catch (err) {
      console.error('Error al eliminar categoría:', err);
    }
  };

  const handleEdit = (cat) => {
    setEditCategory({
      _id: cat._id,
      nombre: cat.nombre || '',
      keywords: cat.keywords || '',
      subcategoria: cat.subcategoria || 'Otro',
      descripcion: cat.descripcion || '',
      activa: typeof cat.activa === 'boolean' ? cat.activa : true,
      imageUrl: cat.imageUrl || ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleSync = async (id) => {
    if (!window.confirm('¿Deseas sincronizar esta categoría?')) return;
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/viral-shorts/admin/sync-viral-shorts/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert('✅ Categoría sincronizada');
    } catch (err) {
      console.error('Error al sincronizar categoría:', err);
      alert('❌ Error al sincronizar categoría');
    }
  };

  const handleEditSave = async () => {
    try {
      const payload = { ...editCategory }; // copia segura
  
      console.log('📤 Enviando update (payload):', payload); // debe tener la URL correcta
  
      await axios.put(`${process.env.REACT_APP_API_URL}/api/short-categories/${payload._id}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      setEditCategory(null);
      fetchCategories();
    } catch (err) {
      console.error('Error al editar categoría:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="short-categories-admin">
      <h2>🎬 Gestión de Categorías de Shorts</h2>

      <div className="form-card">
        <h4>Nueva categoría</h4>
        <input type="text" placeholder="Nombre" value={newCategory.nombre} onChange={(e) => setNewCategory({ ...newCategory, nombre: e.target.value })} />
        <input type="text" placeholder="Keywords" value={newCategory.keywords} onChange={(e) => setNewCategory({ ...newCategory, keywords: e.target.value })} />
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (file) {
              const imageUrl = await uploadViaBackend(file);
              setNewCategory(prev => ({ ...prev, imageUrl }));
            }
          }}
        />
        {newCategory.imageUrl && (
          <img src={newCategory.imageUrl} alt="Preview" style={{ maxWidth: '100px', marginTop: '0.5rem' }} />
        )}
        <select value={newCategory.subcategoria} onChange={(e) => setNewCategory({ ...newCategory, subcategoria: e.target.value })}>
          <option value="">Seleccionar subcategoría</option>
          {subcategoriasDisponibles.map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
        <button onClick={handleAdd}>➕ Añadir</button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="category-grid">
          {categories.map((cat) => (
            <div key={cat._id} className="category-card">
              {editCategory?._id === cat._id ? (
                <>
                  <input name="nombre" value={editCategory.nombre} onChange={handleEditChange} />
                  <input name="keywords" value={editCategory.keywords || ''} onChange={handleEditChange} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        try {
                          const imageUrl = await uploadViaBackend(file);
                          console.log('✅ Imagen subida en edición:', imageUrl);
                          setEditCategory((prev) => ({ ...prev, imageUrl }));
                          console.log('📝 editCategory actualizado:', { ...editCategory, imageUrl });
                        } catch (err) {
                          console.error('❌ Error al subir imagen:', err);
                        }
                      }
                    }}
                  />
                  {editCategory.imageUrl && (
                    <img src={editCategory.imageUrl} alt="Preview" style={{ maxWidth: '100px', marginTop: '0.5rem' }} />
                  )}
                  <select name="subcategoria" value={editCategory.subcategoria || ''} onChange={handleEditChange}>
                    <option value="">Seleccionar subcategoría</option>
                    {subcategoriasDisponibles.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  <div className="btn-group">
                    <button onClick={handleEditSave}>💾</button>
                    <button onClick={() => setEditCategory(null)}>✖</button>
                  </div>
                </>
              ) : (
                <>
                  {cat.imageUrl && (
                    <img src={cat.imageUrl} alt="Miniatura" style={{ maxWidth: '80px', marginBottom: '0.5rem' }} />
                  )}
                  <h4>{cat.nombre}</h4>
                  <p><strong>Keywords:</strong> {cat.keywords || '—'}</p>
                  <p><strong>Subcategoría:</strong> {cat.subcategoria || '—'}</p>
                  <div className="btn-group">
                    <button onClick={() => handleEdit(cat)}>✏️</button>
                    <button onClick={() => handleDelete(cat._id)}>🗑</button>
                    <button onClick={() => handleSync(cat._id)}>🔄</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ShortCategoriesPage;