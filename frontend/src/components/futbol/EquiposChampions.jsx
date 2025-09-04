import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL;

export default function EquiposChampions({ season = '2025' }) {
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let alive = true;

    async function fetchEquipos() {
      setCargando(true);
      try {
        // 1) Intento ruta específica de Champions
        const urlChamp = `${API_BASE}/api/futbol/champions/teams?season=${season}`;
        const { data } = await axios.get(urlChamp);
        if (!alive) return;

        const norm = (Array.isArray(data) ? data : []).map(item => {
          const base = item.team ? item.team : item;
          return {
            _id: item._id || base?._id,
            id: base?.apiId || base?.id,
            name: base?.name,
            shortName: base?.shortName,
            tla: base?.tla,
            logo: base?.logo || base?.crest,
            area: base?.area || base?.country
          };
        });

        setEquipos(norm);
      } catch (err) {
        // 2) Fallback: ruta genérica con competition=CL
        try {
          const urlGen = `${API_BASE}/api/futbol/equipos?competition=CL&season=${season}`;
          const { data } = await axios.get(urlGen);
          if (!alive) return;

          const norm = (Array.isArray(data) ? data : []).map(item => {
            const base = item.team ? item.team : item;
            return {
              _id: item._id || base?._id,
              id: base?.apiId || base?.id,
              name: base?.name,
              shortName: base?.shortName,
              tla: base?.tla,
              logo: base?.logo || base?.crest,
              area: base?.area || base?.country
            };
          });

          setEquipos(norm);
        } catch {
          if (alive) setEquipos([]);
        }
      } finally {
        if (alive) setCargando(false);
      }
    }

    fetchEquipos();
    return () => { alive = false; };
  }, [season]);

  if (cargando) return <p>Cargando equipos…</p>;
  if (!equipos.length) return <p>No hay equipos para {season}.</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'center'
        }}
      >
        {equipos.map((t) => (
          <div
            key={t._id || t.id}
            style={{
              width: '100px',
              textAlign: 'center',
              background: '#1e1e1e',
              padding: '10px',
              borderRadius: '8px'
            }}
          >
            {t.logo && (
              <img
                src={t.logo}
                alt={t.name}
                style={{ width: '60px', height: '60px', objectFit: 'contain' }}
              />
            )}
            <div style={{ color: '#e0e0e0', marginTop: '6px', fontSize: '0.9rem' }}>
              {t.shortName || t.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
