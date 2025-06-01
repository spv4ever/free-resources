import React, { useState, useEffect } from 'react';
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
    scheduledTime: '',
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

useEffect(() => {
  const fetchRemaining = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/youtube/remaining-uploads`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
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

  const handleDateChange = date => {
    setForm(prev => ({ ...prev, scheduledTime: date }));
  };

  const handleFileChange = e => {
    setVideo(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!video) return setMessage('Selecciona un vídeo.');
    if (!form.channelId) return setMessage('Selecciona un canal.');
   
    // 🔁 Actualizar subidas restantes si no es admin
    if (remaining !== '∞') {
    setRemaining(prev => Math.max(0, prev - 1));
    }

    const data = new FormData();
    data.append('title', form.title);
    data.append('description', form.description);
    data.append('tags', form.tags);
    data.append('scheduledTime', form.scheduledTime);
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
            onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
            }
        }
        );
      setMessage(`✅ Subido: ${res.data.link}`);
      setReloadHistory(prev => !prev); // cambia el valor para forzar recarga
      setForm({ title: '', description: '', tags: '', scheduledTime: '', channelId: '' });
      setVideo(null);
    } catch (err) {
      console.error(err);
      setMessage('❌ Error al subir el vídeo');
    } finally {
      setUploading(false);
    }
  };

  const toggleForm = () => setShowForm(prev => !prev);

  if (!['free', 'pro', 'admin'].includes(user?.role)) return null;

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
                    <form onSubmit={handleSubmit} className="youtube-upload-form">
                    <select name="channelId" onChange={handleChange} value={form.channelId} disabled={uploading} required>
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

                    <input type="file" accept="video/*" onChange={handleFileChange} disabled={uploading} required />

                    <button type="submit" disabled={uploading || channels.length === 0}>Subir a YouTube</button>

                    {uploading && <progress value={progress} max="100">{progress}%</progress>}

                    {message && <p>{message}</p>}

                    <a href={`${process.env.REACT_APP_API_URL}/api/youtube/auth/youtube?userId=${user._id}`} target="_blank" rel="noopener noreferrer">
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
)}
export default YoutubeUploadForm;
