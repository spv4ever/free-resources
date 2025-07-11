import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './AdminSportsEvents.css';

const initialForm = {
  title: '',
  description: '',
  location: '',
  start: '',
  end: '',
  sport: '',
  competition: '',
  category: '',
  sessionType: '',
  eventSlug: '',
  metadata: '',
};

const AdminSportsEvents = () => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSport, setFilterSport] = useState('');
  const [startFrom, setStartFrom] = useState('');
  const [startTo, setStartTo] = useState('');
  const sportOptions = [
    { value: 'motogp', label: 'MotoGP' },
    { value: 'formula_1', label: 'Fórmula 1' },
    // puedes añadir más en el futuro
    ];

  const API_URL = process.env.REACT_APP_API_URL;

  const fetchEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API_URL}/api/sports-events`, config);
      setEvents(res.data);
    } catch (err) {
      console.error('Error al obtener eventos:', err);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const toUTCISOString = localDateStr => {
        if (!localDateStr) return '';
        const date = new Date(localDateStr);
        return date.toISOString(); // Esto ya es en UTC
        };

        const payload = {
        ...form,
        start: toUTCISOString(form.start),
        end: toUTCISOString(form.end),
        metadata: form.metadata ? JSON.parse(form.metadata) : {},
        };
        if (!form.sport) {
            alert('El campo "Deporte" es obligatorio.');
            return;
            }

      if (editingId) {
        await axios.put(`${API_URL}/api/sports-events/${editingId}`, payload, config);
      } else {
        await axios.post(`${API_URL}/api/sports-events`, payload, config);
      }

      setForm(initialForm);
      setEditingId(null);
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      console.error('Error al guardar evento:', err);
    }
  };
  const formatDateInput = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    const localISO = new Date(date.getTime() - offset).toISOString();
    return localISO.slice(0, 16); // "YYYY-MM-DDTHH:mm"
    };
  const handleEdit = event => {
    setForm({
        ...event,
        start: formatDateInput(event.start),
        end: formatDateInput(event.end),
        metadata: event.metadata ? JSON.stringify(event.metadata, null, 2) : '',
    });
    setEditingId(event._id);
    setShowModal(true);
    };

  const handleDelete = async id => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    if (window.confirm('¿Eliminar este evento?')) {
      try {
        await axios.delete(`${API_URL}/api/sports-events/${id}`, config);
        fetchEvents();
      } catch (err) {
        console.error('Error al eliminar evento:', err);
      }
    }
  };

  const handleImport = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      await axios.post(`${API_URL}/api/sports-events/import`, json, config);
      setFile(null);
      fetchEvents();
    } catch (err) {
      console.error('Error al importar eventos:', err);
    }

  };
   const filteredEvents = events.filter(event => {
        const matchesSearch =
            event.title.toLowerCase().includes(search.toLowerCase()) ||
            event.location.toLowerCase().includes(search.toLowerCase());

        const matchesSport = filterSport ? event.sport === filterSport : true;

        const eventDate = new Date(event.start).toISOString().slice(0, 10); // YYYY-MM-DD

        const matchesStartFrom = startFrom ? eventDate >= startFrom : true;
        const matchesStartTo = startTo ? eventDate <= startTo : true;

        return matchesSearch && matchesSport && matchesStartFrom && matchesStartTo;
        });

  return (
    <div className="admin-events-container">
      <h2>Gestión de Eventos Deportivos</h2>

      <div className="flex justify-between items-center mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => {
            setForm(initialForm);
            setEditingId(null);
            setShowModal(true);
          }}
        >
          ➕ Crear nuevo evento
        </button>

        <form onSubmit={handleImport}>
          <input
            type="file"
            accept=".json"
            onChange={e => setFile(e.target.files[0])}
            className="mr-2"
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            Importar JSON
          </button>
        </form>
        <div className="filters mb-4 flex gap-4 flex-wrap">
        <input
            type="text"
            placeholder="Buscar por título o ubicación"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input max-w-sm"
        />
        <input
            type="date"
            value={startFrom}
            onChange={e => setStartFrom(e.target.value)}
            className="form-input"
            placeholder="Desde"
            />

            <input
            type="date"
            value={startTo}
            onChange={e => setStartTo(e.target.value)}
            className="form-input"
            placeholder="Hasta"
            />

        <select
            value={filterSport}
            onChange={e => setFilterSport(e.target.value)}
            className="form-input max-w-xs"
        >
            <option value="">Todos los deportes</option>
            {sportOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        </div>
      </div>

      <table className="table-auto w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-2 py-1">Título</th>
            <th className="px-2 py-1">Deporte</th>
            <th className="px-2 py-1">Inicio</th>
            <th className="px-2 py-1">Fin</th>
            <th className="px-2 py-1">Acciones</th>
          </tr>
        </thead>
        <tbody>
            
          {filteredEvents.map(event => (
            <tr key={event._id} className="border-t">
              <td className="px-2 py-1">{event.title}</td>
              <td className="px-2 py-1">{event.sport}</td>
              <td className="px-2 py-1">{new Date(event.start).toLocaleString()}</td>
              <td className="px-2 py-1">{new Date(event.end).toLocaleString()}</td>
              <td className="px-2 py-1 table-actions">
                <button onClick={() => handleEdit(event)} className="edit-btn">Editar</button>
                <button onClick={() => handleDelete(event._id)} className="delete-btn ml-2">Eliminar</button>
                </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para crear o editar */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="text-xl font-bold mb-4">
              {editingId ? 'Editar Evento' : 'Crear Evento'}
            </h3>
            <form onSubmit={handleSubmit}>
              <input className="form-input" type="text" name="title" placeholder="Título" value={form.title} onChange={handleChange} />
              <textarea className="form-input" name="description" placeholder="Descripción" value={form.description} onChange={handleChange} />
              <input className="form-input" type="text" name="location" placeholder="Ubicación" value={form.location} onChange={handleChange} />
              <input className="form-input" type="datetime-local" name="start" value={form.start} onChange={handleChange} />
              <input className="form-input" type="datetime-local" name="end" value={form.end} onChange={handleChange} />
              <select
                name="sport"
                value={form.sport}
                onChange={handleChange}
                className="form-input"
                required
                >
                <option value="">Selecciona un deporte</option>
                {sportOptions.map(option => (
                    <option key={option.value} value={option.value}>
                    {option.label}
                    </option>
                ))}
                </select>
              <input className="form-input" type="text" name="competition" placeholder="Competición" value={form.competition} onChange={handleChange} />
              <input className="form-input" type="text" name="category" placeholder="Categoría" value={form.category} onChange={handleChange} />
              <input className="form-input" type="text" name="sessionType" placeholder="Tipo de sesión" value={form.sessionType} onChange={handleChange} />
              <input className="form-input" type="text" name="eventSlug" placeholder="Slug del evento" value={form.eventSlug} onChange={handleChange} />
              <textarea className="form-input" name="metadata" placeholder="Metadata (JSON)" value={form.metadata} onChange={handleChange} rows={4} />

              <div className="flex justify-between mt-4">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="text-red-500 underline">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSportsEvents;
