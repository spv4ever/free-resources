// src/components/MotoGPCircuitMobileView.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/MotoGPCircuitMobileView.css';

const MotoGPCircuitMobileView = () => {
  const [events, setEvents] = useState([]);
  const [circuitName, setCircuitName] = useState('');
  const [loading, setLoading] = useState(true);
  const sessionDescriptions = {
    FP1: 'Entrenamientos Libres 1',
    FP2: 'Entrenamientos Libres 2',
    FP3: 'Entrenamientos Libres 3',
    FP4: 'Entrenamientos Libres 4',
    FP5: 'Entrenamientos Libres 5',
    FP6: 'Entrenamientos Libres 6',
    FP7: 'Entrenamientos Libres 7',
    FP8: 'Entrenamientos Libres 8',
    FP9: 'Entrenamientos Libres 9',
    Q1: 'Clasificación 1',
    Q2: 'Clasificación 2',
    PR: 'Práctica',
    WUP: 'Warm Up',
    SPR: 'Carrera Sprint',
    RAC: 'Carrera',
    TEST: 'Test'
    };
    const extractSessionType = (summary) => {
        const sessionRegex = /(FP\d|Q\d|SPR|RAC|WUP|PR|TEST)/i;
        const result = sessionRegex.exec(summary);
        return result ? result[1].toUpperCase() : null;
        };

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

  if (loading) return <div className="motogp-mobile">Cargando eventos...</div>;

  return (
    <div className="motogp-mobile">
      <h1>🏁 MotoGP – Próximo circuito</h1>
      <h2>{circuitName}</h2>
      {events.map(e => {
            const sessionType = extractSessionType(e.title);
            const description = sessionDescriptions[sessionType] || '';
            const startDate = new Date(e.start).toLocaleString('es-ES', {
                dateStyle: 'full',
                timeStyle: 'short'
            });
            const countdown = getCountdown(e.start);

            return (
                <div
                key={e._id}
                className="motogp-event-block"
                role="region"
                aria-label={`Evento ${e.title}. ${description ? description + '.' : ''} Empieza el ${startDate}. Tiempo restante: ${countdown}.`}
                >
                <div className="motogp-event-title">{e.title}</div>
                {description && <div className="motogp-event-description">{description}</div>}
                <div className="motogp-event-date">
                    🕒 {startDate}
                </div>
                <div className="motogp-event-countdown">
                    ⏱ {countdown}
                </div>
                </div>
            );
            })}
    </div>
  );
};

export default MotoGPCircuitMobileView;
