import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


const F1CircuitCard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [circuitName, setCircuitName] = useState('');
  const [eventSlug, setEventSlug] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/f1/next-race`);
        const allEvents = res.data.events || [];
        // No filtramos categoría porque en F1 todo es formula_1
        const futureEvents = allEvents.filter(e => new Date(e.start) > new Date());
        futureEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
        setEvents(futureEvents);
        setCircuitName(res.data.circuit || '');
        setEventSlug(res.data.eventSlug || '');
      } catch (err) {
        console.error('Error cargando eventos F1:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getCountdown = (start) => {
    const diff = new Date(start) - new Date();
    if (diff <= 0) return 'En curso';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);

    return parts.join(' ');
  };

  if (loading) return <div>Cargando Fórmula 1...</div>;
  if (events.length === 0) return <div>No hay eventos futuros de Fórmula 1</div>;

  return (
    <div className="card-home">
      <h2>🏁 Próximo Circuito Fórmula 1</h2>
      <p><strong>{circuitName}</strong></p>
      <ul>
        {events.map(e => (
          <li key={e._id}>
            <strong>{e.title}</strong> –{' '}
            {new Date(e.start).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}{' '}
            (
            <span className={getCountdown(e.start) === 'En curso' ? 'en-curso' : ''}>
              {getCountdown(e.start)}
            </span>
            )
          </li>
        ))}
      </ul>
      {eventSlug && (
        <div style={{ marginTop: '1rem' }}>
          <Link to={`/f1/${eventSlug}`} style={{ color: '#ff0000', textDecoration: 'underline' }}>
            Ver detalles del circuito →
          </Link>
        </div>
      )}
    </div>
  );
};

export default F1CircuitCard;
