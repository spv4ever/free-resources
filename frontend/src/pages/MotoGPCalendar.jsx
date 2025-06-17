// src/pages/MotoGPCalendar.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/MotoGPCalendar.css';
import { useNavigate } from 'react-router-dom';

const FILTERS = ['upcoming', 'all'];

const MotoGPCalendar = () => {
  const [circuits, setCircuits] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const navigate = useNavigate();

    useEffect(() => {
    axios
        .get(`${process.env.REACT_APP_API_URL}/api/sports/motogp/calendar`)
        .then((res) => {
        setCircuits(res.data);
        setFiltered(res.data);
        })
        .catch((err) => console.error('Error loading calendar:', err));
    }, []);

    useEffect(() => {
        const now = new Date();
        let result = [...circuits];

        if (activeFilter === 'upcoming') {
            result = result.filter(c => new Date(c.end) > now);
        }

        setFiltered(result);
        }, [activeFilter, circuits]);

  return (
    <div className="motogp-calendar">
      <h1>MotoGP 2025 – Calendario oficial</h1>

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={activeFilter === f ? 'active' : ''}
            onClick={() => setActiveFilter(f)}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid">
        {filtered.map((circuit) => (
          <div
            key={circuit.slug}
            className={`calendar-card ${circuit.hasPassed ? 'past' : ''}`}
            onClick={() => navigate(`/motogp/${circuit.eventSlug || circuit.slug}`)}
            >
            <div className="date-range">
              {new Date(circuit.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -
              {new Date(circuit.end).toLocaleDateString('en-US', { day: 'numeric' })}
            </div>
            <div className="title">{circuit.name}</div>
            <div className="location">{circuit.slug.replace(/-/g, ' ')}</div>
            <div className="categories">
              {circuit.categories.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MotoGPCalendar;
