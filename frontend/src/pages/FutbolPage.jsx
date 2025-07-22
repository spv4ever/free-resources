import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, CalendarCheck, Goal, LineChart } from 'lucide-react';

import ProximosPartidos from '../components/futbol/ProximosPartidos';
import JornadaLaLiga from '../components/futbol/JornadaLaLiga';
import TopGoleadores from '../components/futbol/TopGoleadores';

export default function FutbolPage() {
  useEffect(() => {
    document.title = 'Fútbol | KeikoDev';
  }, []);

  const estilos = {
    pagina: {
      background: '#111',
      color: '#eee',
      fontFamily: 'Lato, sans-serif',
    },
    hero: {
      backgroundImage: 'url(/futbol-hero.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '60px 20px',
      textAlign: 'center',
      borderBottom: '4px solid #2a2a2a',
    },
    heroTitulo: {
      fontSize: '48px',
      marginBottom: '10px',
      textShadow: '2px 2px 10px black',
    },
    heroTexto: {
      fontSize: '20px',
      color: '#ccc',
    },
    contenido: {
      padding: '40px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    seccion: {
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '40px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    },
    tituloSeccion: {
      fontSize: '24px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      borderBottom: '1px solid #333',
      paddingBottom: '10px',
    },
    enlaces: {
      display: 'flex',
      gap: '20px',
      marginTop: '16px',
    },
    enlace: {
      background: '#222',
      padding: '16px 24px',
      borderRadius: '12px',
      color: '#fff',
      textDecoration: 'none',
      fontSize: '18px',
      fontWeight: 'bold',
      border: '1px solid #333',
      transition: 'background 0.2s ease',
      flex: 1,
      textAlign: 'center',
    },
  };

  return (
    <div style={estilos.pagina}>
      {/* Hero */}
      <div style={estilos.hero}>
        <h1 style={estilos.heroTitulo}>⚽ Todo el Fútbol en KeikoDev</h1>
        <p style={estilos.heroTexto}>Competiciones, partidos y estadísticas en tiempo real</p>
      </div>

      <div style={estilos.contenido}>
        {/* Competiciones */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={estilos.seccion}>
          <div style={estilos.tituloSeccion}>
            <Trophy size={24} /> Competiciones
          </div>
          <div style={estilos.enlaces}>
            <Link to="/futbol/laliga" style={estilos.enlace}>LaLiga</Link>
            <Link to="/futbol/champions" style={estilos.enlace}>Champions League</Link>
          </div>
        </motion.div>       

        {/* Próximos partidos */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={estilos.seccion}>
          <div style={estilos.tituloSeccion}>
            <CalendarCheck size={24} /> Próximos partidos
          </div>
          <ProximosPartidos />
        </motion.div>

        {/* Jornada actual LaLiga */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={estilos.seccion}>
          <div style={estilos.tituloSeccion}>
            <Goal size={24} /> Jornada actual – LaLiga
          </div>
          <JornadaLaLiga />
        </motion.div>

        {/* Máximos Goleadores */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={estilos.seccion}>
          <div style={estilos.tituloSeccion}>
            <LineChart size={24} /> Máximos goleadores
          </div>
          <TopGoleadores />
        </motion.div>
      </div>
    </div>
  );
}
