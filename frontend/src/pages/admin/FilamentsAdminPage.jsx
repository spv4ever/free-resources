import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import ImageEditorModal from '../../components/ImageEditorModal';
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
  const [pendingImageEdit, setPendingImageEdit] = useState(null);

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

  const uploadEditedImage = async (fieldName, editedFile, detectedColor) => {
    const payload = new FormData();
    payload.append('image', editedFile);

    try {
      setUploadingField(fieldName);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload/image`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((current) => ({
        ...current,
        [fieldName]: response.data.url,
        ...(fieldName === 'imageUrl' && detectedColor ? { colorHex: detectedColor } : {}),
      }));
      setPreviewRotations((current) => ({ ...current, [fieldName]: 0 }));
      setStatus(
        fieldName === 'spoolImageUrl'
          ? '✅ Imagen definitiva de la bobina subida correctamente'
          : `✅ Tarjeta procesada y subida${detectedColor ? ` · color detectado ${detectedColor}` : ''}`
      );
    } catch (error) {
      console.error('Error al subir imagen:', error);
      setStatus('❌ No se pudo subir la imagen');
      throw error;
    } finally {
      setUploadingField('');
    }
  };

  const handleUpload = (fieldName) => async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPendingImageEdit({
      fieldName,
      file,
      mode: fieldName === 'imageUrl' ? 'card' : 'spool',
    });
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
            <small>Se abrirá un editor para girar, recortar, ajustar y detectar el color antes de subir.</small>
          </label>

          <label>
            <span>URL foto bobina</span>
            <input name="spoolImageUrl" value={formData.spoolImageUrl ?? ''} onChange={handleChange} />
          </label>

          <label>
            <span>Subir foto de la bobina</span>
            <input type="file" accept="image/*" onChange={handleUpload('spoolImageUrl')} disabled={Boolean(uploadingField)} />
            <small>También pasa por el editor antes de enviarse a Cloudinary.</small>
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

      {pendingImageEdit && (
        <ImageEditorModal
          file={pendingImageEdit.file}
          mode={pendingImageEdit.mode}
          onCancel={() => setPendingImageEdit(null)}
          onConfirm={async ({ file: editedFile, detectedColor }) => {
            await uploadEditedImage(pendingImageEdit.fieldName, editedFile, detectedColor);
            setPendingImageEdit(null);
          }}
        />
      )}

        <div className="filaments-admin-form__actions">
          <button type="submit">{editingId ? '💾 Actualizar' : '➕ Crear filamento'}</button>
          <button type="button" className="secondary" onClick={resetForm}>Cancelar</button>
        </div>
      </form>

      <section className="filaments-admin-list">
        {filaments.map((filament) => {
          const detailItems = [
            ['Material', filament.material || '—'],
            ['Color', filament.colorName || '—'],
            ['Acabado', filament.finish || '—'],
            ['Diámetro', filament.diameter ? `${filament.diameter} mm` : '—'],
            ['Bobina', filament.spoolWeightKg ? `${filament.spoolWeightKg} kg` : '—'],
            ['Perfil', filament.printSpeed || '—'],
          ];

          const temperatureRange = [filament.nozzleTempMin, filament.nozzleTempMax].filter(Boolean).join('–');
          const bedRange = [filament.bedTempMin, filament.bedTempMax].filter(Boolean).join('–');

          return (
            <article key={filament._id} className="filaments-admin-card">
              <div className="filaments-admin-card__top">
                <div className="filaments-admin-card__media-group">
                  <div className="filaments-admin-card__media">
                    {filament.imageUrl ? <img src={filament.imageUrl} alt={filament.colorName} /> : <div>Sin imagen</div>}
                  </div>
                  <div className="filaments-admin-card__media">
                    {filament.spoolImageUrl ? <img src={filament.spoolImageUrl} alt={`Bobina ${filament.colorName}`} /> : <div>Sin foto bobina</div>}
                  </div>
                </div>

                <div className="filaments-admin-card__hero">
                  <div className="filaments-admin-card__badges">
                    <span className="filaments-admin-card__badge">{filament.brand || 'Marca'}</span>
                    <span className={`filaments-admin-card__badge ${filament.isActive ? 'is-active' : 'is-hidden'}`}>
                      {filament.isActive ? 'Público' : 'Oculto'}
                    </span>
                  </div>

                  <div className="filaments-admin-card__title-row">
                    <div>
                      <h2>{filament.name || 'Sin referencia'}</h2>
                      <p className="filaments-admin-card__subtitle">{filament.material} · {filament.colorName}</p>
                    </div>
                    <div className="filaments-admin-card__swatch">
                      <span
                        className="filaments-admin-card__swatch-color"
                        style={{ backgroundColor: filament.colorHex || '#334155' }}
                        aria-hidden="true"
                      />
                      <code>{filament.colorHex || 'Sin HEX'}</code>
                    </div>
                  </div>

                  <div className="filaments-admin-card__slug">
                    <span>Slug</span>
                    <code>{filament.slug}</code>
                  </div>
                </div>
              </div>

              <div className="filaments-admin-card__details">
                {detailItems.map(([label, value]) => (
                  <div key={label} className="filaments-admin-card__detail">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
                <div className="filaments-admin-card__detail">
                  <span>Boquilla</span>
                  <strong>{temperatureRange ? `${temperatureRange} ºC` : '—'}</strong>
                </div>
                <div className="filaments-admin-card__detail">
                  <span>Cama</span>
                  <strong>{bedRange ? `${bedRange} ºC` : '—'}</strong>
                </div>
              </div>

              {filament.notes && (
                <div className="filaments-admin-card__notes">
                  <span>Notas</span>
                  <p>{filament.notes}</p>
                </div>
              )}

              <div className="filaments-admin-card__footer">
                <div className="filaments-admin-card__meta">
                  {filament.amazonUrl ? (
                    <a href={filament.amazonUrl} target="_blank" rel="noreferrer">
                      Ver enlace de compra ↗
                    </a>
                  ) : (
                    <span>Sin enlace de compra</span>
                  )}
                </div>

                <div className="filaments-admin-card__actions">
                  <button type="button" onClick={() => handleEdit(filament)}>✏️ Editar</button>
                  <button type="button" className="danger" onClick={() => handleDelete(filament._id)}>🗑 Eliminar</button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

export default FilamentsAdminPage;
