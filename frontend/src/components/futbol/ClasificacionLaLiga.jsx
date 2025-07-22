import { useEffect, useState } from 'react';
import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_URL;
export default function ClasificacionLaLiga({ season = '2025' }) {
  const [clasificacion, setClasificacion] = useState([]);

  useEffect(() => {
    async function fetchClasificacion() {
      try {
        const { data } = await axios.get(`${API_BASE}/api/futbol/laliga/clasificacion?season=${season}`);
        setClasificacion(data);
      } catch (err) {
        console.error('Error al cargar clasificación:', err.message);
      }
    }
    fetchClasificacion();
  }, [season]);

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Clasificación LaLiga {season}</h2>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: '#1e1e1e',
        color: '#e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#2c2c2c' }}>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Equipo</th>
            <th style={thStyle}>PJ</th>
            <th style={thStyle}>PG</th>
            <th style={thStyle}>PE</th>
            <th style={thStyle}>PP</th>
            <th style={thStyle}>GF</th>
            <th style={thStyle}>GC</th>
            <th style={thStyle}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {clasificacion.map((item) => (
            <tr key={item.team._id} style={{ borderBottom: '1px solid #333' }}>
              <td style={tdStyle}>{item.position}</td>
              <td style={{ ...tdStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={item.team.logo}
                  alt={item.team.name}
                  style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                />
                <span>{item.team.shortName || item.team.name}</span>
              </td>
              <td style={tdStyle}>{item.played}</td>
              <td style={tdStyle}>{item.won}</td>
              <td style={tdStyle}>{item.draw}</td>
              <td style={tdStyle}>{item.lost}</td>
              <td style={tdStyle}>{item.goalsFor}</td>
              <td style={tdStyle}>{item.goalsAgainst}</td>
              <td style={tdStyle}>{item.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: '10px',
  fontWeight: 'bold',
  textAlign: 'left',
  fontSize: '0.85rem'
};

const tdStyle = {
  padding: '10px',
  fontSize: '0.85rem'
};
