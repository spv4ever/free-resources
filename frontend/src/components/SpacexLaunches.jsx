
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import '../styles/SpacexLaunches.css';

dayjs.extend(utc);
dayjs.extend(timezone);

const timezones = [
  { label: '🇪🇸 España', zone: 'Europe/Madrid' },
  { label: '🇺🇸 Nueva York', zone: 'America/New_York' },
  { label: '🇦🇷 Argentina', zone: 'America/Argentina/Buenos_Aires' },
  { label: '🇯🇵 Japón', zone: 'Asia/Tokyo' },
  { label: '🇿🇦 Sudáfrica', zone: 'Africa/Johannesburg' },
  { label: '🇦🇺 Australia', zone: 'Australia/Sydney' },
  { label: '🇨🇳 China', zone: 'Asia/Shanghai' },
  { label: '🇸🇦 Arabia Saudí', zone: 'Asia/Riyadh' }
];

const SpacexLaunches = () => {
  const [launches, setLaunches] = useState([]);

  useEffect(() => {
    const fetchLaunches = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/spacex/next-launches`);

        const data = await response.json();
        setLaunches(data);
      } catch (error) {
        console.error('Error fetching launches:', error);
      }
    };
    fetchLaunches();
  }, []);

  return (
    <div className="spacex-container">
      <h2 className="spacex-title">🚀 Próximos Lanzamientos de SpaceX</h2>
      <div className="spacex-cards">
        {launches.map((launch, index) => (
          <Link to={`/launch/${launch._id}`} key={index} className="spacex-card-link">
            <div className="spacex-card">
              {launch.image && (
                <img src={launch.image} alt={launch.name} className="spacex-image" />
              )}
              <h3>{launch.name}</h3>
              <p><strong>Cohete:</strong> {launch.rocketName}</p>
              <p>
                <span className={`status-indicator ${
                  launch.status?.id === 3 ? 'status-success' :
                  [1, 2, 8].includes(launch.status?.id) ? 'status-warning' :
                  [4, 5, 6, 7].includes(launch.status?.id) ? 'status-error' : ''
                }`}></span>
                <strong>Estado:</strong> {launch.status?.name}
              </p>
              <p><strong>Plataforma:</strong> {launch.pad?.name} ({launch.pad?.location?.name})</p>
              <h4 className="spacex-subtitle">🌐 Horarios globales</h4>
              <div className="spacex-times">
                {timezones.map((tz, i) => (
                  <div className="timezone-entry" key={i}>
                    {tz.label}: {dayjs.utc(launch.net).tz(tz.zone).format('DD/MM/YYYY HH:mm')}
                  </div>
                ))}
              </div>
              {launch.webcast && (
                <a href={launch.webcast} target="_blank" rel="noreferrer" className="spacex-link">
                  🔗 Ver lanzamiento en vivo
                </a>
              )}
            </div>
          </Link>
        ))}

      </div>
    </div>
  );
};

export default SpacexLaunches;
