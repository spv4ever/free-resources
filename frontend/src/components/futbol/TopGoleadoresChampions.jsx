import { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

export default function TopGoleadoresChampions({ season = 2025, limit = 15 }) {
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const url = `${API}/api/goleadores/champions?season=${season}`;
    setError('');
    axios.get(url)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data.slice(0, limit) : [];
        setPlayers(data);
      })
      .catch(err => {
        const msg = err?.response?.data?.error || err.message || 'Error desconocido';
        setPlayers([]);
        setError(`No se pudieron cargar los goleadores de Champions: ${msg}`);
        console.error('[TopGoleadoresChampions]', err);
      });
  }, [season, limit]);

  if (error) return <div style={{ color:'#fca5a5' }}>{error}</div>;
  if (!players.length) return <p>No hay datos de goleadores para {season}.</p>;

  return (
    <div style={{ display:'grid', gap:12 }}>
      {players.map((p, i) => (
        <div key={p.uid || i} style={{ background:'#111', border:'1px solid #2a2a2a', borderRadius:10, padding:12 }}>
          <strong>{i + 1}. {p.playerName}</strong>
          <div style={{ fontSize:13, color:'#aaa' }}>{p.teamName}</div>
          <div style={{ marginTop:6 }}>
            Goles: <b>{p.goals}</b> · Asist.: {p.assists ?? 0} · PJ: {p.played ?? 0}
          </div>
        </div>
      ))}
    </div>
  );
}
