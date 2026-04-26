import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import '../../styles/ArticulosAdminPage.css';

const EMPTY_FORM = {
  categoria: '',
  descripcionCorta: '',
  descripcionLarga: '',
  precioCoste: '',
  precioCosteMayorista: '',
  pvp: '',
  pvpMayorista: '',
  costeProtectora: '',
  pvpProtectora: '',
  imageUrl: '',
};

function ArticulosAdminPage() {
  const token = useMemo(() => localStorage.getItem('token'), []);
  const [articulos, setArticulos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDropActive, setIsDropActive] = useState(false);

  const fetchArticulos = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/articulos/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticulos(response.data);
    } catch (error) {
      console.error('Error al cargar artículos:', error);
      setStatus('❌ No se pudieron cargar los artículos');
    }
  }, [token]);

  useEffect(() => {
    fetchArticulos();
  }, [fetchArticulos]);

  const handleChange = ({ target }) => {
    const { name, value } = target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const uploadImage = async (file) => {
    if (!file) return;

    const payload = new FormData();
    payload.append('image', file);

    try {
      setUploadingImage(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload/image`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((current) => ({ ...current, imageUrl: response.data.url }));
      setStatus('✅ Imagen subida correctamente');
    } catch (error) {
      console.error('Error al subir imagen:', error);
      setStatus('❌ No se pudo subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDropActive(false);
    const file = event.dataTransfer?.files?.[0];
    await uploadImage(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/articulos/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatus('✅ Artículo actualizado');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/articulos`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatus('✅ Artículo creado');
      }
      resetForm();
      fetchArticulos();
    } catch (error) {
      console.error('Error al guardar artículo:', error);
      setStatus(`❌ ${error.response?.data?.message || 'No se pudo guardar el artículo'}`);
    }
  };

  const handleEdit = (articulo) => {
    setEditingId(articulo._id);
    setFormData({
      ...EMPTY_FORM,
      ...articulo,
      precioCoste: articulo.precioCoste ?? '',
      precioCosteMayorista: articulo.precioCosteMayorista ?? '',
      pvp: articulo.pvp ?? '',
      pvpMayorista: articulo.pvpMayorista ?? '',
      costeProtectora: articulo.costeProtectora ?? '',
      pvpProtectora: articulo.pvpProtectora ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este artículo?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/articulos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus('✅ Artículo eliminado');
      if (editingId === id) resetForm();
      fetchArticulos();
    } catch (error) {
      console.error('Error al eliminar artículo:', error);
      setStatus('❌ No se pudo eliminar el artículo');
    }
  };

  return (
    <div className="articulos-admin-page">
      <div className="articulos-admin-page__header">
        <p className="articulos-admin-page__eyebrow">Admin · Tarifas</p>
        <h1>📦 Mantenimiento de artículos</h1>
      </div>

      <form className="articulos-admin-form" onSubmit={handleSubmit}>
        <div className="articulos-admin-form__grid">
          <label>
            <span>Categoría</span>
            <input name="categoria" value={formData.categoria} onChange={handleChange} required />
          </label>
          <label>
            <span>Descripción corta</span>
            <input name="descripcionCorta" value={formData.descripcionCorta} onChange={handleChange} />
          </label>
          <label className="articulos-admin-form__full-width">
            <span>Descripción larga</span>
            <textarea name="descripcionLarga" value={formData.descripcionLarga} onChange={handleChange} rows={4} />
          </label>
          {[
            ['precioCoste', 'Precio coste'],
            ['precioCosteMayorista', 'Precio coste mayorista'],
            ['pvp', 'PVP'],
            ['pvpMayorista', 'PVP mayorista'],
            ['costeProtectora', 'Coste protectora'],
            ['pvpProtectora', 'PVP protectora'],
          ].map(([name, label]) => (
            <label key={name}>
              <span>{label}</span>
              <input type="number" min="0" step="0.01" name={name} value={formData[name]} onChange={handleChange} required />
            </label>
          ))}
        </div>

        <div
          className={`articulos-admin-form__dropzone${isDropActive ? ' is-active' : ''}`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDropActive(true);
          }}
          onDragLeave={() => setIsDropActive(false)}
          onDrop={handleDrop}
        >
          <p>🖼️ Imagen opcional: arrastra aquí la imagen del artículo</p>
          <label className="articulos-admin-form__upload-button" htmlFor="articulo-image-upload">
            <input
              id="articulo-image-upload"
              type="file"
              accept="image/*"
              disabled={uploadingImage}
              onChange={(event) => uploadImage(event.target.files?.[0])}
            />
            <span>{uploadingImage ? 'Subiendo...' : 'Seleccionar imagen'}</span>
          </label>
          {formData.imageUrl && <img src={formData.imageUrl} alt="Imagen del artículo" className="articulos-admin-form__preview" />}
        </div>

        <div className="articulos-admin-form__actions">
          <button type="submit">{editingId ? 'Guardar cambios' : 'Crear artículo'}</button>
          {editingId && <button type="button" onClick={resetForm}>Cancelar edición</button>}
        </div>

        {status && <p className="articulos-admin-form__status">{status}</p>}
      </form>

      <section className="articulos-admin-list">
        <h2>Artículos registrados</h2>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Categoría</th>
              <th>Descripción corta</th>
              <th>Coste</th>
              <th>PVP</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {articulos.map((articulo) => (
              <tr key={articulo._id}>
                <td>#{articulo.codigo}</td>
                <td>{articulo.categoria}</td>
                <td>{articulo.descripcionCorta || '—'}</td>
                <td>{Number(articulo.precioCoste).toFixed(2)} €</td>
                <td>{Number(articulo.pvp).toFixed(2)} €</td>
                <td>
                  <button type="button" onClick={() => handleEdit(articulo)}>Editar</button>
                  <button type="button" onClick={() => handleDelete(articulo._id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default ArticulosAdminPage;
