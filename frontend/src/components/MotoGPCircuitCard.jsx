import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MotoGPCircuitCard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [circuitName, setCircuitName] = useState('');
  const [eventSlug, setEventSlug] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/sports/motogp/next`);
        const allEvents = res.data.events || [];
        const filtered = allEvents.filter(e => e.category === 'MotoGP');
        const futureEvents = filtered.filter(e => new Date(e.start) > new Date());
        futureEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
        setEvents(futureEvents);
        setCircuitName(res.data.circuit || '');
        setEventSlug(res.data.eventSlug || '');
      } catch (err) {
        console.error('Error cargando eventos MotoGP:', err);
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

  if (loading) return <div>Cargando MotoGP...</div>;
  if (events.length === 0) return <div>No hay eventos futuros de MotoGP</div>;

  return (
    <div className="card-home">
      <h2>🏁 Próximo Circuito MotoGP</h2>
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
          <Link to={`/motogp/${eventSlug}`} style={{ color: '#00bfff', textDecoration: 'underline' }}>
            Ver detalles del circuito →
          </Link>
        </div>
      )}
    </div>
  );
};

export default MotoGPCircuitCard;
