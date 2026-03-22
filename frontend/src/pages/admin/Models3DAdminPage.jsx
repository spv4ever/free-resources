import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import '../../styles/Models3DAdminPage.css';

const TYPE_OPTIONS = ['llavero', 'iman', 'diseno-especial', 'funcional', 'decoracion', 'organizacion', 'gadget', 'accesorio', 'otro'];
const MATERIAL_OPTIONS = ['PLA', 'PLA+', 'PETG', 'ABS', 'ASA', 'TPU', 'RESINA', 'OTRO'];
const DIFFICULTY_OPTIONS = ['baja', 'media', 'alta'];

const EMPTY_SECONDARY = { url: '', alt: '', caption: '' };
const EMPTY_FORM = {
  title: '',
  shortDescription: '',
  description: '',
  makerworldUrl: '',
  type: 'llavero',
  material: 'PLA',
  sizeLabel: '',
  dimensions: '',
  colorsCount: 1,
  printTime: '',
  weightGrams: '',
  difficulty: 'baja',
  mainImageUrl: '',
  secondaryImages: [{ ...EMPTY_SECONDARY }],
  tags: '',
  notes: '',
  isFeatured: false,
  isActive: true,
};

function Models3DAdminPage() {
  const [models, setModels] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [status, setStatus] = useState('');
  const token = useMemo(() => localStorage.getItem('token'), []);

  const fetchModels = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/models-3d/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModels(response.data);
    } catch (error) {
      console.error('Error al cargar modelos:', error);
      setStatus('❌ No se pudieron cargar los modelos');
    }
  }, [token]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleChange = ({ target }) => {
    const { name, value, type, checked } = target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSecondaryChange = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      secondaryImages: current.secondaryImages.map((image, currentIndex) => (
        currentIndex === index ? { ...image, [field]: value } : image
      )),
    }));
  };

  const addSecondaryImage = () => {
    setFormData((current) => ({
      ...current,
      secondaryImages: [...current.secondaryImages, { ...EMPTY_SECONDARY }],
    }));
  };

  const removeSecondaryImage = (index) => {
    setFormData((current) => ({
      ...current,
      secondaryImages: current.secondaryImages.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setUploadingMainImage(false);
  };

  const buildPayload = () => ({
    ...formData,
    secondaryImages: formData.secondaryImages.filter((image) => image.url.trim()),
  });

  const handleMainImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const payload = new FormData();
    payload.append('image', file);

    try {
      setUploadingMainImage(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload/image`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFormData((current) => ({
        ...current,
        mainImageUrl: response.data.url,
      }));
      setStatus('✅ Imagen principal subida correctamente');
    } catch (error) {
      console.error('Error al subir imagen principal:', error);
      setStatus('❌ No se pudo subir la imagen principal');
    } finally {
      setUploadingMainImage(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = buildPayload();
      if (editingId) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/models-3d/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatus('✅ Modelo actualizado');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/models-3d`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatus('✅ Modelo creado');
      }
      resetForm();
      fetchModels();
    } catch (error) {
      console.error('Error al guardar modelo:', error);
      setStatus(`❌ ${error.response?.data?.message || 'No se pudo guardar el modelo'}`);
    }
  };

  const handleEdit = (model) => {
    setEditingId(model._id);
    setFormData({
      ...EMPTY_FORM,
      ...model,
      colorsCount: model.colorsCount ?? 1,
      weightGrams: model.weightGrams ?? '',
      tags: Array.isArray(model.tags) ? model.tags.join(', ') : '',
      secondaryImages: model.secondaryImages?.length ? model.secondaryImages : [{ ...EMPTY_SECONDARY }],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este modelo?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/models-3d/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus('✅ Modelo eliminado');
      if (editingId === id) resetForm();
      fetchModels();
    } catch (error) {
      console.error('Error al eliminar modelo:', error);
      setStatus('❌ No se pudo eliminar el modelo');
    }
  };

  return (
    <div className="models-admin-page">
      <div className="models-admin-page__header">
        <div>
          <p className="models-admin-page__eyebrow">Admin · 3DPrints by Keiko</p>
          <h1>🧩 Gestión de modelos 3D</h1>
          <p>CRUD completo para gestionar modelos con MakerWorld opcional, galería, tamaños, colores, etiquetas y notas.</p>
        </div>
      </div>

      <form className="models-admin-form" onSubmit={handleSubmit}>
        <div className="models-admin-form__grid">
          <label><span>Nombre del modelo</span><input name="title" value={formData.title} onChange={handleChange} required /></label>
          <label><span>MakerWorld</span><input name="makerworldUrl" value={formData.makerworldUrl} onChange={handleChange} placeholder="https://makerworld.com/..." /></label>
          <label>
            <span>Tipo</span>
            <select name="type" value={formData.type} onChange={handleChange}>{TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select>
          </label>
          <label>
            <span>Material</span>
            <select name="material" value={formData.material} onChange={handleChange}>{MATERIAL_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select>
          </label>
          <label><span>Tamaño</span><input name="sizeLabel" value={formData.sizeLabel} onChange={handleChange} placeholder="Pequeño, mediano..." /></label>
          <label><span>Dimensiones</span><input name="dimensions" value={formData.dimensions} onChange={handleChange} placeholder="80 x 40 x 3 mm" /></label>
          <label><span>Número de colores</span><input type="number" min="0" name="colorsCount" value={formData.colorsCount} onChange={handleChange} /></label>
          <label><span>Tiempo de impresión</span><input name="printTime" value={formData.printTime} onChange={handleChange} placeholder="2h 30m" /></label>
          <label><span>Peso (g)</span><input type="number" min="0" name="weightGrams" value={formData.weightGrams} onChange={handleChange} /></label>
          <label>
            <span>Dificultad</span>
            <select name="difficulty" value={formData.difficulty} onChange={handleChange}>{DIFFICULTY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select>
          </label>
          <div className="models-admin-form__image-field">
            <span>Imagen principal</span>
            <div className="models-admin-form__image-input-row">
              <input name="mainImageUrl" value={formData.mainImageUrl} onChange={handleChange} placeholder="https://..." />
              <label htmlFor="models-main-image-upload" className={`models-admin-form__upload-button${uploadingMainImage ? ' is-disabled' : ''}`}>
                <input id="models-main-image-upload" type="file" accept="image/*" onChange={handleMainImageUpload} disabled={uploadingMainImage} />
                <span>{uploadingMainImage ? 'Subiendo...' : 'Subir foto principal'}</span>
              </label>
            </div>
            {formData.mainImageUrl && (
              <div className="models-admin-form__image-preview">
                <img src={formData.mainImageUrl} alt="Vista previa de la imagen principal" />
              </div>
            )}
          </div>
          <label><span>Etiquetas</span><input name="tags" value={formData.tags} onChange={handleChange} placeholder="regalo, anime, escritorio" /></label>
        </div>

        <label className="models-admin-form__full"><span>Descripción corta</span><textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows="2" /></label>
        <label className="models-admin-form__full"><span>Descripción completa</span><textarea name="description" value={formData.description} onChange={handleChange} rows="5" /></label>
        <label className="models-admin-form__full"><span>Notas</span><textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" /></label>

        <div className="models-admin-form__secondary">
          <div className="models-admin-form__secondary-head">
            <h2>Imágenes secundarias</h2>
            <button type="button" onClick={addSecondaryImage}>+ Añadir imagen</button>
          </div>
          {formData.secondaryImages.map((image, index) => (
            <div key={`${index}-${image.url}`} className="models-admin-form__secondary-row">
              <input value={image.url} onChange={(event) => handleSecondaryChange(index, 'url', event.target.value)} placeholder="URL imagen" />
              <input value={image.alt} onChange={(event) => handleSecondaryChange(index, 'alt', event.target.value)} placeholder="Alt" />
              <input value={image.caption} onChange={(event) => handleSecondaryChange(index, 'caption', event.target.value)} placeholder="Pie de foto" />
              <button type="button" onClick={() => removeSecondaryImage(index)}>Eliminar</button>
            </div>
          ))}
        </div>

        <div className="models-admin-form__toggles">
          <label><input type="checkbox" name="isFeatured" checked={Boolean(formData.isFeatured)} onChange={handleChange} /><span>Modelo destacado</span></label>
          <label><input type="checkbox" name="isActive" checked={Boolean(formData.isActive)} onChange={handleChange} /><span>Visible en catálogo público</span></label>
        </div>

        <div className="models-admin-form__actions">
          <button type="submit">{editingId ? 'Guardar cambios' : 'Crear modelo'}</button>
          {editingId && <button type="button" onClick={resetForm}>Cancelar edición</button>}
        </div>
        {status && <p className="models-admin-form__status">{status}</p>}
      </form>

      <section className="models-admin-list">
        <h2>Modelos guardados</h2>
        <div className="models-admin-list__grid">
          {models.map((model) => (
            <article key={model._id} className="models-admin-card">
              <div className="models-admin-card__image">
                {model.mainImageUrl ? <img src={model.mainImageUrl} alt={model.title} /> : <div>Sin imagen</div>}
              </div>
              <div className="models-admin-card__content">
                <h3>{model.title}</h3>
                <p>{model.type} · {model.material}</p>
                <p>{model.shortDescription || 'Sin descripción corta'}</p>
                <div className="models-admin-card__meta">
                  <span>{model.isActive ? 'Visible' : 'Oculto'}</span>
                  <span>{model.secondaryImages?.length || 0} imágenes extra</span>
                </div>
                <div className="models-admin-card__actions">
                  <button type="button" onClick={() => handleEdit(model)}>Editar</button>
                  <button type="button" onClick={() => handleDelete(model._id)}>Eliminar</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Models3DAdminPage;
