import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL;

export default function TopGoleadores() {
  const [goleadores, setGoleadores] = useState([]);
  const [temporada, setTemporada] = useState(2025);
  const [competicion, setCompeticion] = useState('laliga');

  useEffect(() => {
    const cargarGoleadores = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/goleadores/${competicion}?season=${temporada}`
        );
        setGoleadores(res.data);
      } catch (err) {
        console.error('Error al cargar goleadores:', err);
        setGoleadores([]);
      }
    };

    cargarGoleadores();
  }, [competicion, temporada]);

  const estilos = {
    contenedor: {
      marginTop: '40px',
    },
    filtros: {
      display: 'flex',
      gap: '16px',
      marginBottom: '20px',
      alignItems: 'center',
    },
    select: {
      backgroundColor: '#222',
      color: '#fff',
      border: '1px solid #555',
      borderRadius: '6px',
      padding: '6px 12px',
      fontSize: '14px',
      cursor: 'pointer',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '20px',
    },
    card: {
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    nombre: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: '4px',
    },
    equipo: {
      fontSize: '13px',
      color: '#bbb',
    },
    goles: {
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#7fff7f',
    },
    titulo: {
      fontSize: '22px',
      fontWeight: 'bold',
      marginBottom: '16px',
    },
    sinDatos: {
      color: '#bbb',
      fontStyle: 'italic',
    },
  };

  return (
    <section style={estilos.contenedor}>
      <div style={estilos.filtros}>
        <select
          value={competicion}
          onChange={e => setCompeticion(e.target.value)}
          style={estilos.select}
        >
          <option value="laliga">LaLiga</option>
          <option value="champions">Champions League</option>
        </select>

        <select
          value={temporada}
          onChange={e => setTemporada(parseInt(e.target.value))}
          style={estilos.select}
        >
          <option value={2025}>Temporada 2025</option>
          <option value={2024}>Temporada 2024</option>
        </select>
      </div>

      <h2 style={estilos.titulo}>
        Máximos Goleadores – {competicion === 'laliga' ? 'LaLiga' : 'Champions'} {temporada}
      </h2>

      {goleadores.length > 0 ? (
        <div style={estilos.grid}>
          {goleadores.map((g, i) => (
            <div key={g.playerId || i} style={estilos.card}>
              <div>
                <div style={estilos.nombre}>{g.playerName}</div>
                <div style={estilos.equipo}>{g.teamName}</div>
              </div>
              <div style={estilos.goles}>{g.goals}</div>
            </div>
          ))}
        </div>
      ) : (
        <p style={estilos.sinDatos}>No hay datos disponibles.</p>
      )}
    </section>
  );
}
