// src/pages/MotoGPCircuitPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/MotoGPCircuitPage.css';

const MotoGPCircuitPage = () => {
  const { slug } = useParams();
  const [selectedDay, setSelectedDay] = useState('');
  const [days, setDays]             = useState([]);
  const [events, setEvents]         = useState({});
  const [eventName, setEventName]   = useState('');
  const [circuit, setCircuit]       = useState('');
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/sports/motogp/${slug}`
        );
        const { eventName, circuit, events: evts } = res.data;
        setEventName(eventName);
        setCircuit(circuit);

        // agrupamos por día
        const grouped = evts.reduce((acc, ev) => {
          const dayKey = new Date(ev.start).toLocaleDateString('es-ES', {
            weekday: 'short', day: 'numeric', month: 'short'
          });
          acc[dayKey] = acc[dayKey] || [];
          acc[dayKey].push(ev);
          return acc;
        }, {});
        setEvents(grouped);

        const availableDays = Object.keys(grouped);
        setDays(availableDays);
        setSelectedDay(availableDays[0]);
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const formatHour = dateStr =>
    new Date(dateStr).toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit', hour12: false
    });

  const categoryClass = cat =>
    cat === 'MotoGP' ? 'motogp' :
    cat === 'Moto2'  ? 'moto2' :
    cat === 'Moto3'  ? 'moto3' : '';

  if (loading) {
    return <div className="motogp-circuit-page"><p>Cargando datos...</p></div>;
  }

  if (!days.length) {
    return <div className="motogp-circuit-page"><p>No hay eventos.</p></div>;
  }

  return (
    <div className="circuit-layout">
      <div className="circuit-content">
        <h1 className="page-title">🏁 {eventName}</h1>
        <p className="circuit-subtitle">📍 {circuit}</p>

        <div className="circuit-image-box">
          <img
            src={`/images/circuits/${slug}.svg`}
            alt={`Circuito ${circuit}`}
            onError={e => (e.target.style.display = 'none')}
          />
        </div>

        <div className="day-tabs">
          {days.map(day => (
            <button
              key={day}
              className={selectedDay === day ? 'active' : ''}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </button>
          ))}
        </div>

        <table className="event-table">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Categoría</th>
              <th>Sesión</th>
            </tr>
          </thead>
          <tbody>
            {events[selectedDay].map(ev => (
              <tr key={ev._id} className={categoryClass(ev.category)}>
                <td>{formatHour(ev.start)}</td>
                <td>{ev.category}</td>
                <td>{ev.title.replace(/ – .*/, '')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MotoGPCircuitPage;
