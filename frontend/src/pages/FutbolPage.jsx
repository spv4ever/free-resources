import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, CalendarCheck, Goal, LineChart, RefreshCw, Shield, ArrowRightLeft } from 'lucide-react';

// LaLiga
import ProximosPartidos from '../components/futbol/ProximosPartidos';
import JornadaLaLiga from '../components/futbol/JornadaLaLiga';
import TopGoleadores from '../components/futbol/TopGoleadores';

// Champions (asegúrate de tener estos 3 componentes creados)
import ProximosPartidosChampions from '../components/futbol/ProximosPartidosChampions';
import JornadaChampions from '../components/futbol/JornadaChampions';
import TopGoleadoresChampions from '../components/futbol/TopGoleadoresChampions';

// Contexto de usuario + cliente axios
import { useUser } from '../context/UserContext';
import API from '../utils/api';

export default function FutbolPage() {
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    document.title = 'Fútbol | KeikoDev';
  }, []);

  // --- Estado global ---
  const [scope, setScope] = useState('todo'); // 'todo' | 'calendario' | 'resultados'
  const [season, setSeason] = useState(2025);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([]);
  const [refreshTick, setRefreshTick] = useState(0); // fuerza remount de widgets
  const [updateStandings, setUpdateStandings] = useState(true);

  // NUEVO: selector de competición activa para los widgets (PD = LaLiga, CL = Champions)
  const [competitionView, setCompetitionView] = useState('PD'); // 'PD' | 'CL'

  // Panel admin: elegir qué competiciones actualizar
  const [updatePD, setUpdatePD] = useState(true);
  const [updateCL, setUpdateCL] = useState(true);

  // Si tu API.baseURL ya incluye "/api" (p.ej. https://api.keikodev.es/api), pon API_PREFIX = ''.
  const API_PREFIX = '/api';

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
    // --- estilos admin ---
    adminBar: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      alignItems: 'center',
      background: '#151515',
      border: '1px solid #2a2a2a',
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '24px',
    },
    adminBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 14px',
      borderRadius: '10px',
      border: '1px solid #0ea5e9',
      background: '#0891b2',
      color: '#fff',
      cursor: 'pointer',
      fontWeight: 700,
    },
    adminBtnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
    adminSelect: {
      background: '#1f1f1f',
      color: '#fff',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '8px',
    },
    adminInput: {
      width: 110,
      background: '#1f1f1f',
      color: '#fff',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '8px',
    },
    adminCheckboxWrap: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 10px',
      border: '1px solid #333',
      borderRadius: 8,
      background: '#1a1a1a',
    },
    adminLog: {
      marginTop: 8,
      padding: '10px 12px',
      border: '1px dashed #444',
      borderRadius: '10px',
      background: '#141414',
      fontSize: 14,
      color: '#cfcfcf',
    },
    chipGroup: { display: 'flex', gap: 8 },
    chip: (active) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      borderRadius: 10,
      border: active ? '1px solid #10b981' : '1px solid #333',
      color: active ? '#10b981' : '#ddd',
      background: active ? '#0b1f1a' : '#1a1a1a',
      cursor: 'pointer',
      fontWeight: 700,
    }),
  };

  // --- Helpers para llamar a TUS endpoints del router de fútbol ---
  const importarPartidos = (competitionCode, competitionName) =>
    API.post(`${API_PREFIX}/futbol/partidos/sync`, { competitionCode, competitionName, season });

  const importarGoleadores = (competitionCode, competitionName) =>
    API.post(`${API_PREFIX}/futbol/goleadores/sync`, { competitionCode, competitionName, season });

  const syncStandings = (competitionCode) =>
    API.post(`${API_PREFIX}/futbol/standings/sync`, { competitionCode, season });

  const runAdminUpdate = async () => {
    const comps = [];
    if (updatePD) comps.push({ code: 'PD', name: 'LaLiga' });
    if (updateCL) comps.push({ code: 'CL', name: 'Champions League' });

    if (!comps.length) {
      alert('Selecciona al menos una competición (LaLiga o Champions).');
      return;
    }

    const ok = window.confirm(
      `¿Actualizar fútbol (${scope}) para la temporada ${season}?\n` +
      `Competiciones: ${comps.map(c => c.name).join(', ')}\n` +
      (updateStandings ? '• También se actualizará la clasificación.' : '')
    );
    if (!ok) return;

    setLoading(true);
    setLog([]);
    try {
      const steps = [];

      if (scope === 'calendario' || scope === 'todo') {
        for (const c of comps) {
          try {
            await importarPartidos(c.code, c.name);
            steps.push(`🗓️ Calendario actualizado: ${c.name} ${season}`);
          } catch (err) {
            steps.push(`⚠️ Calendario NO actualizado: ${c.name}. Motivo: ${err?.response?.data?.error || err.message}`);
          }
        }
      }

      if (scope === 'resultados' || scope === 'todo') {
        for (const c of comps) {
          try {
            // refresco previo por si hay cambios del día
            await importarPartidos(c.code, c.name);
            await importarGoleadores(c.code, c.name);
            steps.push(`🥅 Resultados + goleadores: ${c.name} ${season}`);

            // Clasificación para cualquiera seleccionada (PD y/o CL)
            if (updateStandings) {
              await syncStandings(c.code);
              steps.push(`📊 Clasificación actualizada: ${c.name} ${season}`);
            }
          } catch (err) {
            steps.push(`⚠️ Resultados/Goleadores/Clasificación NO actualizados: ${c.name}. Motivo: ${err?.response?.data?.error || err.message}`);
          }
        }
      }

      setLog([`✅ Proceso terminado (con posibles avisos)`, ...steps]);
      setRefreshTick((t) => t + 1); // fuerza remount de widgets
    } catch (e) {
      setLog([`❌ Error general: ${e?.response?.data?.error || e.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={estilos.pagina}>
      {/* Hero */}
      <div style={estilos.hero}>
        <h1 style={estilos.heroTitulo}>⚽ Todo el Fútbol en KeikoDev</h1>
        <p style={estilos.heroTexto}>Competiciones, partidos y estadísticas en tiempo real</p>
      </div>

      <div style={estilos.contenido}>
        {/* --- Panel ADMIN (solo visible si eres admin) --- */}
        {isAdmin && (
          <div style={estilos.adminBar}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
              <Shield size={18} /> Admin
            </span>

            <label>
              <span style={{ marginRight: 8 }}>Alcance:</span>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                style={estilos.adminSelect}
              >
                <option value="todo">Todo (calendario + resultados/goleadores)</option>
                <option value="calendario">Solo calendario</option>
                <option value="resultados">Resultados + goleadores</option>
              </select>
            </label>

            <label>
              <span style={{ marginRight: 8 }}>Temporada:</span>
              <input
                type="number"
                min="2020"
                max="2100"
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
                style={estilos.adminInput}
              />
            </label>

            {/* Qué competiciones actualizar */}
            <label style={estilos.adminCheckboxWrap} title="Incluir LaLiga (PD)">
              <input type="checkbox" checked={updatePD} onChange={(e) => setUpdatePD(e.target.checked)} />
              <span>LaLiga</span>
            </label>
            <label style={estilos.adminCheckboxWrap} title="Incluir Champions (CL)">
              <input type="checkbox" checked={updateCL} onChange={(e) => setUpdateCL(e.target.checked)} />
              <span>Champions</span>
            </label>

            {/* Clasificación */}
            <label style={estilos.adminCheckboxWrap} title="Actualizar clasificación tras resultados">
              <input
                type="checkbox"
                checked={updateStandings}
                onChange={(e) => setUpdateStandings(e.target.checked)}
              />
              <span>Actualizar clasificación</span>
            </label>

            <button
              onClick={runAdminUpdate}
              disabled={loading}
              style={{ ...estilos.adminBtn, ...(loading ? estilos.adminBtnDisabled : {}) }}
              title="Ejecutar actualización manual"
            >
              <RefreshCw size={18} />
              {loading ? 'Actualizando…' : 'Actualizar ahora'}
            </button>

            {log.length > 0 && (
              <div style={estilos.adminLog}>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {log.map((l, i) => <li key={i}>{l}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Competiciones (links a páginas dedicadas) */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={estilos.seccion}>
          <div style={estilos.tituloSeccion}>
            <Trophy size={24} /> Competiciones
          </div>
          <div style={estilos.enlaces}>
            <Link to="/futbol/laliga" style={estilos.enlace}>LaLiga</Link>
            <Link to="/futbol/champions" style={estilos.enlace}>Champions League</Link>
          </div>
        </motion.div>

        {/* Selector de competición para widgets de la home de fútbol */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} style={estilos.seccion}>
          <div style={estilos.tituloSeccion}>
            <ArrowRightLeft size={22} /> Vista de widgets
          </div>
          <div style={estilos.chipGroup}>
            <button
              onClick={() => setCompetitionView('PD')}
              style={estilos.chip(competitionView === 'PD')}
            >
              LaLiga
            </button>
            <button
              onClick={() => setCompetitionView('CL')}
              style={estilos.chip(competitionView === 'CL')}
            >
              Champions
            </button>
          </div>
        </motion.div>

        {/* Próximos partidos (según competición seleccionada) */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={estilos.seccion}>
          <div style={estilos.tituloSeccion}>
            <CalendarCheck size={24} /> Próximos partidos – {competitionView === 'PD' ? 'LaLiga' : 'Champions'}
          </div>
          {competitionView === 'PD' ? (
            <ProximosPartidos key={`pp-pd-${refreshTick}`} />
          ) : (
            <ProximosPartidosChampions key={`pp-cl-${refreshTick}`} />
          )}
        </motion.div>

        {/* Jornada actual (según competición) */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={estilos.seccion}>
          <div style={estilos.tituloSeccion}>
            <Goal size={24} /> Jornada / Ronda actual – {competitionView === 'PD' ? 'LaLiga' : 'Champions'}
          </div>
          {competitionView === 'PD' ? (
            <JornadaLaLiga key={`jl-pd-${refreshTick}`} />
          ) : (
            <JornadaChampions key={`jl-cl-${refreshTick}`} defaultSeason={String(season)} />
          )}
        </motion.div>

        {/* Máximos Goleadores (según competición) */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={estilos.seccion}>
          <div style={estilos.tituloSeccion}>
            <LineChart size={24} /> Máximos goleadores – {competitionView === 'PD' ? 'LaLiga' : 'Champions'}
          </div>
          {competitionView === 'PD' ? (
            <TopGoleadores key={`tg-pd-${refreshTick}`} />
          ) : (
            <TopGoleadoresChampions key={`tg-cl-${refreshTick}`} season={String(season)} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
