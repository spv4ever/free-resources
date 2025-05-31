import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/YoutubeUploadForm.css';

function YoutubeUploadForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: '',
    scheduledTime: null,
    channelId: ''
  });
  const [video, setVideo] = useState(null);
  const [channels, setChannels] = useState([]);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/youtube/channels`);
        setChannels(res.data);
      } catch (err) {
        console.error('Error al cargar canales:', err);
      }
    };

    fetchChannels();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'title' ? value.replace(/(^|\s)\S/g, l => l.toUpperCase()) : value
    }));
  };

  const handleFileChange = e => {
    setVideo(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');

    if (!video) return setMessage('Selecciona un vídeo.');
    if (!form.channelId) return setMessage('Selecciona un canal.');

    const data = new FormData();
    data.append('title', form.title);
    data.append('description', form.description);
    data.append('tags', form.tags);
    if (form.scheduledTime) data.append('scheduledTime', form.scheduledTime.toISOString());
    data.append('channelId', form.channelId);
    data.append('video', video);

    setUploading(true);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/youtube/upload`,
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: progressEvent => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        }
      );

      setMessage(`✅ Subido: ${res.data.link}`);
      setForm({ title: '', description: '', tags: '', scheduledTime: null, channelId: '' });
      setVideo(null);
      setProgress(0);
    } catch (err) {
      console.error(err);
      setMessage('❌ Error al subir el vídeo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="youtube-upload-container">
      <button onClick={() => setShowForm(!showForm)} className="toggle-button">
        {showForm ? '⬆️ Ocultar subida' : '⬇️ Mostrar subida a YouTube'}
      </button>

      {showForm && (
        <form className="youtube-upload-form" onSubmit={handleSubmit}>
          <select name="channelId" value={form.channelId} onChange={handleChange} required disabled={uploading}>
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
            required
            disabled={uploading}
          />

          <textarea
            name="description"
            placeholder="Descripción"
            value={form.description}
            onChange={handleChange}
            required
            disabled={uploading}
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
            onChange={(date) => setForm({ ...form, scheduledTime: date })}
            showTimeSelect
            timeIntervals={15}
            timeCaption="Hora"
            dateFormat="Pp"
            placeholderText="Fecha y hora de publicación"
            className="datepicker-dark"
            disabled={uploading}
          />

          <input type="file" accept="video/*" onChange={handleFileChange} disabled={uploading} />

          {uploading && <progress value={progress} max="100">{progress}%</progress>}

          <button type="submit" disabled={uploading}>
            {uploading ? 'Subiendo...' : 'Subir a YouTube'}
          </button>

          {message && <p className="upload-message">{message}</p>}
        </form>
      )}

      <a
        href={`${process.env.REACT_APP_API_URL}/api/youtube/auth/youtube`}
        target="_blank"
        rel="noreferrer"
        className="auth-link"
      >
        ➕ Autorizar nuevo canal
      </a>
    </div>
  );
}

export default YoutubeUploadForm;
