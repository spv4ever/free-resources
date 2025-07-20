import { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

export default function ProximosPartidos() {
  const [partidos, setPartidos] = useState([]);

  useEffect(() => {
    axios.get(`${API}/api/partidos/proximos`)
      .then(res => {
        const todos = res.data;
        const primerDia = todos.length > 0 ? todos[0].start.split('T')[0] : null;
        const mismosDia = todos.filter(p => p.start.startsWith(primerDia));
        setPartidos(mismosDia);
      })
      .catch(err => console.error('Error al cargar partidos:', err));
  }, []);

  if (!partidos.length) {
    return <p style={estilos.mensaje}>No hay partidos programados próximamente.</p>;
  }

  return (
    <div style={estilos.grid}>
      {partidos.map(p => (
        <div key={p.uid} style={estilos.card}>
          <div style={estilos.fecha}>
            {new Date(p.start).toLocaleString('es-ES', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <h3 style={estilos.titulo}>{p.title}</h3>
          <p style={estilos.estado}>Estado: {p.status}</p>
          {p.score?.fullTime?.home !== null && (
            <p style={estilos.resultado}>
              {p.score.fullTime.home} - {p.score.fullTime.away}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

const estilos = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#181818',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #333',
    boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
  },
  fecha: {
    fontSize: '14px',
    color: '#aaa',
    marginBottom: '8px',
  },
  titulo: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '6px',
  },
  estado: {
    fontSize: '14px',
    color: '#ccc',
    marginBottom: '6px',
  },
  resultado: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#4caf50',
  },
  mensaje: {
    color: '#bbb',
    fontStyle: 'italic',
    marginTop: '16px',
  },
};
