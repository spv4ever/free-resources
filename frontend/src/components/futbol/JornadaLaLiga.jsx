import { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

const estilos = {
  select: {
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    border: '1px solid #444',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '14px',
    marginRight: '10px',
    appearance: 'none',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#222',
    border: '1px solid #444',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    transition: 'border 0.2s ease',
  },
  fechaHora: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#bbb',
    marginBottom: '8px',
  },
  equipos: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#fff',
    margin: '10px 0',
  },
  estado: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#facc15',
  },
};

export default function JornadaLaLiga() {
  const [jornada, setJornada] = useState(null);
  const [jornadasDisponibles, setJornadasDisponibles] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [temporada, setTemporada] = useState(2025);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resJornadas, resAuto] = await Promise.all([
          axios.get(`${API}/api/partidos/laliga/jornadas?season=${temporada}`),
          axios.get(`${API}/api/partidos/laliga/jornada/auto?season=${temporada}`)
        ]);

        const jornadas = resJornadas.data || [];
        const partidosAuto = resAuto.data || [];

        setJornadasDisponibles(jornadas);

        if (partidosAuto.length > 0) {
          const matchday = partidosAuto[0].metadata?.matchday;
          if (matchday) {
            setJornada(matchday);
            setPartidos(partidosAuto);
          }
        }
      } catch (err) {
        console.error('Error al cargar jornadas o jornada actual:', err);
      }
    };

    cargarDatos();
  }, [temporada]);

  useEffect(() => {
    if (jornada && partidos.length === 0) {
      axios
        .get(`${API}/api/partidos/laliga/jornada/${jornada}?season=${temporada}`)
        .then(res => setPartidos(res.data))
        .catch(err => console.error('Error al cargar jornada:', err));
    }
  }, [jornada, partidos.length, temporada]);

  const handleTemporadaChange = (e) => {
    const nuevaTemporada = parseInt(e.target.value);
    setTemporada(nuevaTemporada);
    setJornada(null);
    setPartidos([]);
    setJornadasDisponibles([]);
  };

  return (
    <section style={{ marginTop: '40px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
        <select value={temporada} onChange={handleTemporadaChange} style={estilos.select}>
          <option value={2025}>Temporada 2025</option>
          <option value={2024}>Temporada 2024</option>
        </select>

        <select
          value={jornada || ''}
          onChange={e => {
            setJornada(parseInt(e.target.value));
            setPartidos([]);
          }}
          style={estilos.select}
        >
          <option value="">Selecciona jornada</option>
          {jornadasDisponibles.map(j => (
            <option key={j} value={j}>Jornada {j}</option>
          ))}
        </select>
      </div>

      {jornada && (
        <>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
            🏆 Jornada {jornada} — Temporada {temporada}
          </h2>
          <div style={estilos.grid}>
            {partidos.map(p => (
              <div key={p.uid} style={estilos.card}>
                <div style={estilos.fechaHora}>
                  <span>📅 {new Date(p.start).toLocaleDateString('es-ES')}</span>
                  <span>🕒 {new Date(p.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={estilos.equipos}>
                  {p.homeTeam} <br /> <span style={{ color: '#bbb', fontSize: '14px' }}>vs</span> <br /> {p.awayTeam}
                </div>
                {p.score?.fullTime?.home !== null ? (
                  <div style={{ textAlign: 'center', fontSize: '20px', color: '#7fff7f' }}>
                    {p.score.fullTime.home} - {p.score.fullTime.away}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '13px', color: '#999' }}>
                    Aún no se ha jugado
                  </div>
                )}
                <div style={estilos.estado}>Estado: {p.status}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
