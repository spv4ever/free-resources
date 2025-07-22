import { useEffect, useState } from 'react';
import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_URL;

export default function EquiposLaLiga({ season = '2025' }) {
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    async function fetchEquipos() {
      const { data } = await axios.get(`${API_BASE}/api/futbol/laliga/equipos?season=${season}`);
      setEquipos(data);
    }
    fetchEquipos();
  }, [season]);

  return (
    <div style={{ padding: '1rem' }}>
      {/* <h2 style={{ marginBottom: '1rem' }}>Equipos LaLiga {season}</h2> */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'center'
      }}>
        {equipos.map(({ team }) => (
          <div key={team._id} style={{
            width: '100px',
            textAlign: 'center',
            background: '#1e1e1e',
            padding: '10px',
            borderRadius: '8px'
          }}>
            <img src={team.logo} alt={team.name} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
            <div style={{ color: '#e0e0e0', marginTop: '6px', fontSize: '0.9rem' }}>{team.shortName || team.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
