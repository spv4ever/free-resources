import { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

export default function ProximosPartidosChampions() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Backend actual: GET /api/partidos/proximos (sin filtro por competición)
    // Si quieres solo Champions, ver nota al final para añadir filtro en backend.
    const url = `${API}/api/partidos/proximos`;

    setError('');
    axios.get(url)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        // Filtra a Champions en el cliente (temporalmente), porque la ruta no acepta ?competition
        const championsOnly = data.filter(p => p.competition === 'Champions League');
        setItems(championsOnly);
      })
      .catch(err => {
        const msg = err?.response?.data?.error || err.message || 'Error desconocido';
        setItems([]);
        setError(`No se pudieron cargar próximos partidos: ${msg}`);
        console.error('[ProximosPartidosChampions]', err);
      });
  }, []);

  if (error) return <div style={{ color:'#fca5a5' }}>{error}</div>;
  if (!items.length) return <p>No hay próximos partidos de Champions.</p>;

  return (
    <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))' }}>
      {items.map((p, i) => (
        <div key={p.uid || i} style={{ background:'#111', border:'1px solid #2a2a2a', borderRadius:10, padding:12 }}>
          <div style={{ fontSize:12, color:'#aaa', marginBottom:6 }}>
            {new Date(p.start).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day:'2-digit', month:'2-digit' })}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
            <span>{p.homeTeam}</span>
            <b>vs</b>
            <span>{p.awayTeam}</span>
          </div>
          <div style={{ fontSize:12, color:'#999', marginTop:6 }}>Estado: {p.status}</div>
        </div>
      ))}
    </div>
  );
}
