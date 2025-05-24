import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/SpacexHistory.css';

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
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SpacexHistory;
