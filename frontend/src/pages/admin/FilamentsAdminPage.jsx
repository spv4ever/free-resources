import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import '../../styles/FilamentsAdminPage.css';

const EMPTY_FORM = {
  brand: '',
  name: '',
  material: 'PLA',
  colorName: '',
  colorHex: '#000000',
  finish: '',
  diameter: '1.75',
  spoolWeightKg: '1',
  nozzleTempMin: '',
  nozzleTempMax: '',
  bedTempMin: '',
  bedTempMax: '',
  printSpeed: '',
  imageUrl: '',
  spoolImageUrl: '',
  amazonUrl: '',
  notes: '',
  isActive: true,
};

const EMPTY_ROTATIONS = {
  imageUrl: 0,
  spoolImageUrl: 0,
};

function FilamentsAdminPage() {
  const [filaments, setFilaments] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [uploadingField, setUploadingField] = useState('');
  const [status, setStatus] = useState('');
  const [previewRotations, setPreviewRotations] = useState(EMPTY_ROTATIONS);

  const token = useMemo(() => localStorage.getItem('token'), []);

  const fetchFilaments = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/filaments/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFilaments(response.data);
    } catch (error) {
      console.error('Error al cargar filamentos:', error);
      setStatus('❌ No se pudieron cargar los filamentos');
    }
  }, [token]);

  useEffect(() => {
    fetchFilaments();
  }, [fetchFilaments]);

  const handleChange = ({ target }) => {
    const { name, value, type, checked } = target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setStatus('');
    setPreviewRotations(EMPTY_ROTATIONS);
  };

  const rotatePreview = (fieldName, delta) => {
    setPreviewRotations((current) => ({
      ...current,
      [fieldName]: (((current[fieldName] || 0) + delta) % 360 + 360) % 360,
    }));
  };

  const handleUpload = (fieldName) => async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const payload = new FormData();
    payload.append('image', file);

    try {
      setUploadingField(fieldName);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload/image`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((current) => ({ ...current, [fieldName]: response.data.url }));
      setPreviewRotations((current) => ({ ...current, [fieldName]: 0 }));
      setStatus(
        fieldName === 'spoolImageUrl'
          ? '✅ Imagen de la bobina subida correctamente'
          : '✅ Imagen principal subida correctamente'
      );
    } catch (error) {
      console.error('Error al subir imagen:', error);
      setStatus('❌ No se pudo subir la imagen');
    } finally {
      setUploadingField('');
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/filaments/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatus('✅ Filamento actualizado');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/filaments`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatus('✅ Filamento creado');
      }
      resetForm();
      fetchFilaments();
    } catch (error) {
      console.error('Error al guardar filamento:', error);
      setStatus(`❌ ${error.response?.data?.message || 'No se pudo guardar el filamento'}`);
    }
  };

  const handleEdit = (filament) => {
    setEditingId(filament._id);
    setFormData({
      ...EMPTY_FORM,
      ...filament,
      diameter: filament.diameter ?? '',
      spoolWeightKg: filament.spoolWeightKg ?? '',
      nozzleTempMin: filament.nozzleTempMin ?? '',
      nozzleTempMax: filament.nozzleTempMax ?? '',
      bedTempMin: filament.bedTempMin ?? '',
      bedTempMax: filament.bedTempMax ?? '',
    });
    setPreviewRotations(EMPTY_ROTATIONS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este filamento?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/filaments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus('✅ Filamento eliminado');
      if (editingId === id) resetForm();
      fetchFilaments();
    } catch (error) {
      console.error('Error al eliminar filamento:', error);
      setStatus('❌ No se pudo eliminar el filamento');
    }
  };

  return (
    <div className="filaments-admin-page">
      <div className="filaments-admin-page__header">
        <div>
          <p className="filaments-admin-page__eyebrow">Admin · 3DPrints by Keiko</p>
          <h1>🧵 Gestión de filamentos</h1>
          <p>Crea, edita y elimina fichas de filamentos con imagen de tarjeta de color, foto de la bobina y enlace de compra.</p>
        </div>
      </div>

      <form className="filaments-admin-form" onSubmit={handleSubmit}>
        <div className="filaments-admin-form__grid">
          {[
            ['brand', 'Marca'],
            ['name', 'Modelo / Referencia'],
            ['material', 'Material'],
            ['colorName', 'Nombre del color'],
            ['finish', 'Acabado'],
            ['diameter', 'Diámetro (mm)'],
            ['spoolWeightKg', 'Peso bobina (kg)'],
            ['nozzleTempMin', 'Boquilla min (ºC)'],
            ['nozzleTempMax', 'Boquilla max (ºC)'],
            ['bedTempMin', 'Cama min (ºC)'],
            ['bedTempMax', 'Cama max (ºC)'],
            ['printSpeed', 'Velocidad / perfil'],
            ['amazonUrl', 'Comprar en Amazon'],
          ].map(([name, label]) => (
            <label key={name}>
              <span>{label}</span>
              <input name={name} value={formData[name] ?? ''} onChange={handleChange} />
            </label>
          ))}

          <label>
            <span>Color HEX</span>
            <div className="filaments-admin-form__color-row">
              <input type="color" name="colorHex" value={formData.colorHex || '#000000'} onChange={handleChange} />
              <input name="colorHex" value={formData.colorHex ?? ''} onChange={handleChange} />
            </div>
          </label>

          <label>
            <span>URL imagen tarjeta</span>
            <input name="imageUrl" value={formData.imageUrl ?? ''} onChange={handleChange} />
          </label>

          <label>
            <span>Subir imagen principal</span>
            <input type="file" accept="image/*" onChange={handleUpload('imageUrl')} disabled={Boolean(uploadingField)} />
          </label>

          <label>
            <span>URL foto bobina</span>
            <input name="spoolImageUrl" value={formData.spoolImageUrl ?? ''} onChange={handleChange} />
          </label>

          <label>
            <span>Subir foto de la bobina</span>
            <input type="file" accept="image/*" onChange={handleUpload('spoolImageUrl')} disabled={Boolean(uploadingField)} />
          </label>
        </div>

        <label className="filaments-admin-form__notes">
          <span>Notas de impresión</span>
          <textarea name="notes" value={formData.notes ?? ''} onChange={handleChange} rows="5" />
        </label>

        <label className="filaments-admin-form__checkbox">
          <input type="checkbox" name="isActive" checked={Boolean(formData.isActive)} onChange={handleChange} />
          <span>Visible en catálogo público</span>
        </label>

        {(formData.imageUrl || formData.spoolImageUrl) && (
          <div className="filaments-admin-form__preview-grid">
            {[
              ['imageUrl', 'Imagen principal', 'Tarjeta de color'],
              ['spoolImageUrl', 'Foto de la bobina', 'Bobina del filamento'],
            ].map(([fieldName, title, alt]) => {
              if (!formData[fieldName]) return null;

              const rotation = previewRotations[fieldName] || 0;
              const isVertical = rotation === 90 || rotation === 270;

              return (
                <div key={fieldName} className="filaments-admin-form__preview">
                  <div className="filaments-admin-form__preview-header">
                    <p>{title}</p>
                    <div className="filaments-admin-form__preview-actions">
                      <button type="button" onClick={() => rotatePreview(fieldName, -90)}>
                        ↺ Girar
                      </button>
                      <button type="button" onClick={() => rotatePreview(fieldName, 90)}>
                        ↻ Girar
                      </button>
                    </div>
                  </div>
                  <div className={`filaments-admin-form__preview-frame${isVertical ? ' is-vertical' : ''}`}>
                    <img
                      src={formData[fieldName]}
                      alt={alt}
                      style={{ transform: `rotate(${rotation}deg)` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {status && <p className="filaments-admin-form__status">{status}</p>}

        <div className="filaments-admin-form__actions">
          <button type="submit">{editingId ? '💾 Actualizar' : '➕ Crear filamento'}</button>
          <button type="button" className="secondary" onClick={resetForm}>Cancelar</button>
        </div>
      </form>

      <section className="filaments-admin-list">
        {filaments.map((filament) => (
          <article key={filament._id} className="filaments-admin-card">
            <div className="filaments-admin-card__media-group">
              <div className="filaments-admin-card__media">
                {filament.imageUrl ? <img src={filament.imageUrl} alt={filament.colorName} /> : <div>Sin imagen</div>}
              </div>
              <div className="filaments-admin-card__media">
                {filament.spoolImageUrl ? <img src={filament.spoolImageUrl} alt={`Bobina ${filament.colorName}`} /> : <div>Sin foto bobina</div>}
              </div>
            </div>
            <div className="filaments-admin-card__content">
              <h2>{filament.brand} · {filament.name}</h2>
              <p>{filament.material} · {filament.colorName}</p>
              <p>Slug: <code>{filament.slug}</code></p>
              <p>{filament.isActive ? '✅ Público' : '🚫 Oculto'}</p>
              <div className="filaments-admin-card__actions">
                <button type="button" onClick={() => handleEdit(filament)}>✏️ Editar</button>
                <button type="button" className="danger" onClick={() => handleDelete(filament._id)}>🗑 Eliminar</button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default FilamentsAdminPage;
