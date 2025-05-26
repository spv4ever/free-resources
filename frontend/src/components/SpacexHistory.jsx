import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/SpacexHistory.css';
import { FaYoutube } from 'react-icons/fa'; // Asegúrate de tener instalado react-icons

const SpacexHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/spacex/history`);
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        console.error('Error cargando historial:', err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="spacex-history">
      {history.map((launch, i) => (
        <Link to={`/launch/${launch._id}`} key={i} className="history-card-link">
          <div className="history-card">
            <h4>{launch.name}</h4>
            <p>{new Date(launch.net).toLocaleString()}</p>
            <p>Estado: {launch.status?.name}</p>
            {launch.webcastManualEmbed && (
              <a
                href={launch.webcastManualEmbed}
                target="_blank"
                rel="noopener noreferrer"
                title="Ver webcast en YouTube"
                style={{ marginLeft: '0.5rem', color: '#FF0000', fontSize: '1.5rem' }}
              >
                <FaYoutube />
              </a>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SpacexHistory;
