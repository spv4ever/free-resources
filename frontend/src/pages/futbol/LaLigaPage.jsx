import { useEffect } from 'react';
import JornadaLaLiga from '../../components/futbol/JornadaLaLiga';
import TopGoleadores from '../../components/futbol/TopGoleadores';
import ProximosPartidos from '../../components/futbol/ProximosPartidos';
import EquiposLaLiga from '../../components/futbol/EquiposLaLiga';
import ClasificacionLaLiga from '../../components/futbol/ClasificacionLaLiga';

export default function LaLigaPage() {
  useEffect(() => {
    document.title = 'LaLiga – Resultados y Estadísticas | KeikoDev';
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
      marginBottom: '30px',
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
      <h1 style={estilos.titulo}>⚽ LaLiga – Temporada 2025</h1>
      <p style={estilos.descripcion}>
        Consulta resultados, jornadas, goleadores y próximos partidos de LaLiga en tiempo real.
      </p>

      <div style={estilos.seccion}>
        <h2 style={estilos.subtitulo}>Equipos LaLiga</h2>
        {/* otras secciones: jornada, goleadores, etc. */}
        <EquiposLaLiga season="2025" />
      </div>

      <div style={estilos.seccion}>
        <h2 style={estilos.subtitulo}>Clasificación</h2>
        {/* otras secciones: jornada, goleadores, etc. */}
        <ClasificacionLaLiga season="2025" />
      </div>

      <div style={estilos.seccion}>
        <h2 style={estilos.subtitulo}>Jornada en curso</h2>
        <JornadaLaLiga />
      </div>

      <div style={estilos.seccion}>
        <h2 style={estilos.subtitulo}>Máximos goleadores</h2>
        <TopGoleadores />
      </div>

      <div style={estilos.seccion}>
        <h2 style={estilos.subtitulo}>Próximos partidos</h2>
        <ProximosPartidos />
      </div>
    </div>
  );
}
