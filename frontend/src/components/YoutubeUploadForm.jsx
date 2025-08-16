import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/YoutubeUploadForm.css';
import { useUser } from '../context/UserContext';
import YoutubeUploadHistory from './YoutubeUploadHistory';

function YoutubeUploadForm() {
  const { user } = useUser();

  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: '',
    scheduledTime: null, // ← mejor null para react-datepicker
    channelId: ''
  });

  const [video, setVideo] = useState(null);
  const [channels, setChannels] = useState([]);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [reloadHistory, setReloadHistory] = useState(false);
  const [remaining, setRemaining] = useState(null);

  const fileRef = useRef(null);

  useEffect(() => {
    const fetchRemaining = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/youtube/remaining-uploads`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setRemaining(res.data.remaining);
      } catch (err) {
        console.error('Error al obtener límite restante:', err);
      }
    };
    if (user) fetchRemaining();
  }, [user]);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/youtube/channels?userId=${user._id}`);
        setChannels(res.data);
      } catch (err) {
        console.error('Error al cargar canales:', err);
      }
    };
    if (user) fetchChannels();
  }, [user]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'title' ? value.toUpperCase() : value }));
  };

  const handleDateChange = date => setForm(prev => ({ ...prev, scheduledTime: date }));

  const handleFileChange = e => setVideo(e.target.files[0] || null);

  const handleSubmit = async e => {
    e.preventDefault(); // usamos validación propia
    setMessage('');

    if (!video) return setMessage('Selecciona un vídeo.');
    if (!form.channelId) return setMessage('Selecciona un canal.');

    // Construir FormData
    const data = new FormData();
    data.append('title', form.title);
    data.append('description', form.description);
    data.append('tags', form.tags);
    data.append('scheduledTime', form.scheduledTime ? form.scheduledTime.toISOString() : '');
    data.append('channelId', form.channelId);
    data.append('video', video);

    try {
      setUploading(true);
      setProgress(0);

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/youtube/upload?userId=${user._id}`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          onUploadProgress: (pe) => {
            if (pe.total) {
              const percent = Math.round((pe.loaded * 100) / pe.total);
              setProgress(percent);
            }
          }
        }
      );

      setMessage(`✅ Subido: ${res.data.link}`);
      setReloadHistory(prev => !prev);
      setForm({ title: '', description: '', tags: '', scheduledTime: null, channelId: '' });
      setVideo(null);

      // 🔁 Actualizar subidas restantes si no es admin
      if (remaining !== '∞') setRemaining(prev => Math.max(0, (prev ?? 0) - 1));
    } catch (err) {
      console.error(err);
      setMessage('❌ Error al subir el vídeo');
    } finally {
      setUploading(false);
    }
  };

  const toggleForm = () => setShowForm(prev => !prev);

  if (!['free', 'pro', 'admin'].includes(user?.role)) return null;

  // Estilos de ocultación accesible (evita display:none)
  const visuallyHidden = {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0
  };

  return (
    <div className="youtube-upload-container">
      <button className="toggle-upload-btn" onClick={toggleForm}>
        {showForm ? 'Ocultar subida a YouTube' : '📤 Subir video a YouTube'}
      </button>

      {remaining !== null && (
        <p className="upload-remaining">
          🎯 Te quedan <strong>{remaining}</strong> subida{remaining === 1 ? '' : 's'} disponibles hoy.
        </p>
      )}

      {showForm && channels.length === 0 && (
        <p className="upload-warning">
          ⚠️ No tienes canales autorizados. Usa el botón <strong>“➕ Autorizar nuevo canal”</strong> para conectar uno.
        </p>
      )}

      {showForm && (
        <div className="youtube-upload-layout">
          {remaining === 0 ? (
            <p className="upload-warning">🚫 Has alcanzado tu límite diario de subidas.</p>
          ) : (
            <>
              <form noValidate onSubmit={handleSubmit} className="youtube-upload-form">
                <select
                  name="channelId"
                  onChange={handleChange}
                  value={form.channelId}
                  disabled={uploading}
                  required
                >
                  <option value="">Selecciona un canal</option>
                  {channels.map(channel => (
                    <option key={channel.channelId} value={channel.channelId}>
                      {channel.channelTitle}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  name="title"
                  placeholder="Título"
                  value={form.title}
                  onChange={handleChange}
                  disabled={uploading}
                  required
                />

                <textarea
                  name="description"
                  placeholder="Descripción"
                  value={form.description}
                  onChange={handleChange}
                  disabled={uploading}
                  required
                />

                <input
                  type="text"
                  name="tags"
                  placeholder="Etiquetas (coma separadas)"
                  value={form.tags}
                  onChange={handleChange}
                  disabled={uploading}
                />

                <DatePicker
                  selected={form.scheduledTime}
                  onChange={handleDateChange}
                  showTimeSelect
                  timeIntervals={15}
                  timeCaption="Hora"
                  dateFormat="Pp"
                  placeholderText="Fecha y hora de publicación"
                  disabled={uploading}
                />

                {/* Campo de fichero accesible + botón personalizado */}
                <input
                  id="video"
                  name="video"             // ← IMPORTANTE
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  // required  // ← quitado; validamos en JS para evitar “not focusable”
                  ref={fileRef}
                  style={visuallyHidden}
                />
                <div className="file-row">
                  <label htmlFor="video" className="file-label">Vídeo</label>
                  <button
                    type="button"
                    className="file-button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    Elegir vídeo
                  </button>
                  <span className="file-name">
                    {video ? video.name : 'Ningún archivo seleccionado'}
                  </span>
                </div>

                <button type="submit" disabled={uploading || channels.length === 0}>
                  Subir a YouTube
                </button>

                {uploading && <progress value={progress} max="100">{progress}%</progress>}

                {message && <p>{message}</p>}

                <a
                  href={`${process.env.REACT_APP_API_URL}/api/youtube/auth/youtube?userId=${user._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ➕ Autorizar nuevo canal
                </a>
              </form>

              <div className="youtube-upload-history-wrapper">
                <YoutubeUploadHistory reload={reloadHistory} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default YoutubeUploadForm;
