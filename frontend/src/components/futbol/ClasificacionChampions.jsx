import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL;

/**
 * Soporta dos formatos:
 * 1) Grupos: [{ group:"A", table:[ { team:{name,crest}, played, ... } ] }, ...]
 * 2) Tabla plana: [{ position, played, won, ..., team:{...} }, ...]
 */
export default function ClasificacionChampions({ season = '2025' }) {
  const [data, setData] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let alive = true;

    async function fetchStandings() {
      setCargando(true);
      try {
        // 1) Intento ruta específica de Champions
        const urlChamp = `${API_BASE}/api/futbol/champions/standings?season=${season}`;
        const { data } = await axios.get(urlChamp);
        if (alive) setData(Array.isArray(data) ? data : []);
      } catch (err) {
        // 2) Fallback: ruta genérica con competition=CL
        try {
          const urlGen = `${API_BASE}/api/futbol/clasificacion?competition=CL&season=${season}`;
          const { data } = await axios.get(urlGen);
          if (alive) setData(Array.isArray(data) ? data : []);
        } catch {
          if (alive) setData([]);
        }
      } finally {
        if (alive) setCargando(false);
      }
    }

    fetchStandings();
    return () => { alive = false; };
  }, [season]);

  const isGrouped = useMemo(
    () => Array.isArray(data) && data.length > 0 && data[0]?.group && Array.isArray(data[0]?.table),
    [data]
  );

  if (cargando) return <p>Cargando clasificación…</p>;
  if (!Array.isArray(data) || data.length === 0) return <p>No hay clasificación para {season}.</p>;

  const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 14 };
  const thtd = { borderBottom: '1px solid #333', padding: '6px' };

  if (isGrouped) {
    // Render por grupos
    return (
      <div style={{
        display: 'grid', gap: '16px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))'
      }}>
        {data.map((g, idx) => (
          <div key={g.group || idx} style={{ background:'#111', border:'1px solid #2a2a2a', borderRadius:12, padding:12 }}>
            <h3 style={{ marginTop: 0 }}>Grupo {g.group}</h3>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thtd}>Equipo</th>
                  <th style={thtd}>PJ</th>
                  <th style={thtd}>G</th>
                  <th style={thtd}>E</th>
                  <th style={thtd}>P</th>
                  <th style={thtd}>GF</th>
                  <th style={thtd}>GC</th>
                  <th style={thtd}>DG</th>
                  <th style={thtd}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {(g.table || []).map((row, i) => (
                  <tr key={row.team?.id || i}>
                    <td style={thtd}>
                      {row.team?.crest && <img src={row.team.crest} alt="" style={{ width:16, verticalAlign:'middle', marginRight:6 }} />}
                      {row.team?.name || row.teamName}
                    </td>
                    <td style={thtd}>{row.played}</td>
                    <td style={thtd}>{row.won}</td>
                    <td style={thtd}>{row.draw}</td>
                    <td style={thtd}>{row.lost}</td>
                    <td style={thtd}>{row.gf}</td>
                    <td style={thtd}>{row.ga}</td>
                    <td style={thtd}>{row.gd}</td>
                    <td style={thtd}><strong>{row.points}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  }

  // Render tabla plana (tipo LaLiga)
  return (
    <div style={{ background:'#111', border:'1px solid #2a2a2a', borderRadius:12, padding:12 }}>
      <h3 style={{ marginTop: 0 }}>Tabla general</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thtd}>#</th>
            <th style={thtd}>Equipo</th>
            <th style={thtd}>PJ</th>
            <th style={thtd}>G</th>
            <th style={thtd}>E</th>
            <th style={thtd}>P</th>
            <th style={thtd}>GF</th>
            <th style={thtd}>GC</th>
            <th style={thtd}>DG</th>
            <th style={thtd}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {data.map((s, i) => {
            const team = s.team || {};
            return (
              <tr key={team.id || i}>
                <td style={thtd}>{s.position ?? i + 1}</td>
                <td style={thtd}>
                  {team.crest && <img src={team.crest} alt="" style={{ width:16, verticalAlign:'middle', marginRight:6 }} />}
                  {team.name || s.teamName}
                </td>
                <td style={thtd}>{s.played ?? s.playedGames}</td>
                <td style={thtd}>{s.won}</td>
                <td style={thtd}>{s.draw}</td>
                <td style={thtd}>{s.lost}</td>
                <td style={thtd}>{s.goalsFor ?? s.gf}</td>
                <td style={thtd}>{s.goalsAgainst ?? s.ga}</td>
                <td style={thtd}>{s.goalDifference ?? s.gd}</td>
                <td style={thtd}><strong>{s.points}</strong></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
