import { useEffect, useState } from 'react';
import JornadaChampions from '../../components/futbol/JornadaChampions';
import TopGoleadoresChampions from '../../components/futbol/TopGoleadoresChampions';
import ProximosPartidosChampions from '../../components/futbol/ProximosPartidosChampions';
import EquiposChampions from '../../components/futbol/EquiposChampions';
import ClasificacionChampions from '../../components/futbol/ClasificacionChampions';

export default function ChampionsPage() {
  const [season, setSeason] = useState('2025'); // por defecto 2025, puedes cambiar a 2024 si existe en BD

  useEffect(() => {
    document.title = 'UEFA Champions League – Resultados y Estadísticas | KeikoDev';
  }, []);

  const estilos = {
    contenedor: {
      padding: '40px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
      color: '#eee',
      fontFamily: 'Lato, sans-serif',
    },
    titulo: {
      fontSize: '36px',
      marginBottom: '10px',
      borderBottom: '2px solid #444',
      paddingBottom: '8px',
    },
    descripcion: {
      fontSize: '18px',
      color: '#ccc',
      marginBottom: '20px',
    },
    toolbar: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      marginBottom: '30px',
    },
    select: {
      background: '#121212',
      color: '#eee',
      border: '1px solid #333',
      borderRadius: '10px',
      padding: '8px 12px',
    },
    seccion: {
      marginBottom: '40px',
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    },
    subtitulo: {
      fontSize: '24px',
      marginBottom: '16px',
      borderBottom: '1px solid #333',
      paddingBottom: '6px',
    },
  };

  return (
    <div style={estilos.contenedor}>
      <h1 style={estilos.titulo}>🏆 UEFA Champions League – Temporada {season}</h1>
      <p style={estilos.descripcion}>
        Consulta equipos, clasificación por grupos/fases, jornadas/partidos, goleadores y próximos encuentros de la Champions en tiempo real.
      </p>

      <div style={estilos.toolbar}>
        <label>Temporada:</label>
        <select
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          style={estilos.select}
        >
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
      </div>

      <div style={estilos.seccion}>
        <h2 style={estilos.subtitulo}>Equipos</h2>
        <EquiposChampions season={season} />
      </div>

      <div style={estilos.seccion}>
        <h2 style={estilos.subtitulo}>Clasificación / Fase de grupos</h2>
        <ClasificacionChampions season={season} />
      </div>

      <div style={estilos.seccion}>
        <h2 style={estilos.subtitulo}>Jornada / Ronda en curso</h2>
        <JornadaChampions defaultSeason={season} />
      </div>

      <div style={estilos.seccion}>
        <h2 style={estilos.subtitulo}>Máximos goleadores</h2>
        <TopGoleadoresChampions season={season} />
      </div>

      <div style={estilos.seccion}>
        <h2 style={estilos.subtitulo}>Próximos partidos</h2>
        <ProximosPartidosChampions />
      </div>
    </div>
  );
}
