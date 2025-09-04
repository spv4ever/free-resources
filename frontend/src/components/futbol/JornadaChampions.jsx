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
  errorBox: {
    background: '#2b1d1f',
    border: '1px solid #7f1d1d',
    color: '#ffe4e6',
    padding: '10px 12px',
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 12
  }
};

export default function JornadaChampions() {
  const [jornada, setJornada] = useState(null);
  const [jornadasDisponibles, setJornadasDisponibles] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [temporada, setTemporada] = useState(2025);
  const [error, setError] = useState('');

  // Carga lista de jornadas y jornada “auto”
  useEffect(() => {
    const cargarDatos = async () => {
      setError('');
      try {
        const urlJ = `${API}/api/partidos/champions/jornadas?season=${temporada}`;
        const urlA = `${API}/api/partidos/champions/jornada/auto?season=${temporada}`;

        // Importante: log de las URLs reales a las que pegamos
        console.debug('[Champions] GET', urlJ);
        console.debug('[Champions] GET', urlA);

        const [resJornadas, resAuto] = await Promise.all([
          axios.get(urlJ),
          axios.get(urlA)
        ]);

        const jornadas = resJornadas.data || [];
        const partidosAuto = resAuto.data || [];

        setJornadasDisponibles(jornadas);

        if (partidosAuto.length > 0) {
          const matchday = partidosAuto[0]?.metadata?.matchday;
          if (matchday) {
            setJornada(matchday);
            setPartidos(partidosAuto);
          }
        }
      } catch (err) {
        // pinta el mensaje del backend si existe
        const msg = err?.response?.data?.error || err?.message || 'Error desconocido';
        console.error('[Champions] jornadas/auto error:', err);
        setError(`No se pudieron cargar las jornadas de Champions: ${msg}`);
      }
    };

    setJornada(null);
    setPartidos([]);
    setJornadasDisponibles([]);
    cargarDatos();
  }, [temporada]);

  // Carga jornada concreta
  useEffect(() => {
    if (jornada && partidos.length === 0) {
      const url = `${API}/api/partidos/champions/jornada/${jornada}?season=${temporada}`;
      console.debug('[Champions] GET', url);
      axios
        .get(url)
        .then(res => setPartidos(res.data || []))
        .catch(err => {
          const msg = err?.response?.data?.error || err?.message || 'Error desconocido';
          console.error('[Champions] jornada error:', err);
          setError(`No se pudo cargar la jornada ${jornada}: ${msg}`);
        });
    }
  }, [jornada, partidos.length, temporada]);

  const handleTemporadaChange = (e) => {
    const nuevaTemporada = parseInt(e.target.value, 10);
    setTemporada(nuevaTemporada);
    setJornada(null);
    setPartidos([]);
    setJornadasDisponibles([]);
    setError('');
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
            setJornada(parseInt(e.target.value, 10));
            setPartidos([]);
            setError('');
          }}
          style={estilos.select}
        >
          <option value="">Selecciona jornada</option>
          {jornadasDisponibles.map(j => (
            <option key={j} value={j}>Jornada {j}</option>
          ))}
        </select>
      </div>

      {error && <div style={estilos.errorBox}>{error}</div>}

      {jornada && !error && (
        <>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
            🏆 Champions — Jornada {jornada} · Temporada {temporada}
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
