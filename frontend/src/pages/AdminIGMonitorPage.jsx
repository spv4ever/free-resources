import React, { useMemo, useState } from 'react';
import IGMonitor from '../components/IGMonitor.jsx';
import WeeklyCalendarBeta from '../components/WeeklyCalendarBeta.jsx';

// misma base que tu .env
const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');
const IG_ALIAS = 'keikodevfree';

export default function AdminIGMonitorPage() {
  let user = null;
  try {
    const raw = localStorage.getItem('user');
    if (raw) user = JSON.parse(raw);
  } catch {}

  const isAdmin = useMemo(() => user && user.role === 'admin', [user]);

  // ⚠️ Hooks ANTES del early return (para cumplir reglas de hooks)
  const [tab, setTab] = useState('monitor');

  // auth header para pasar al calendario (si /api/weekly requiere auth)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  if (!isAdmin) {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <h1 style={styles.title}>Acceso restringido</h1>
          <p style={styles.muted}>Esta sección es solo para administradores.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <style>{css}</style>

      <div style={styles.card}>
        <h1 style={styles.title}>IG Admin — {IG_ALIAS}</h1>
        <p style={styles.muted}>Inventario, publicaciones y planificación.</p>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${tab === 'monitor' ? 'tab--active' : ''}`}
            onClick={() => setTab('monitor')}
          >
            Monitor
          </button>
          <button
            className={`tab ${tab === 'calendar' ? 'tab--active' : ''}`}
            onClick={() => setTab('calendar')}
          >
            Calendario semanal (beta)
          </button>
        </div>

        {/* Contenido */}
        {tab === 'monitor' && (
          <>
            <ActionsPanel />
            <div style={{ marginTop: 16 }}>
              <IGMonitor refreshMs={30000} />
            </div>
          </>
        )}

        {tab === 'calendar' && (
          <div style={{ marginTop: 16 }}>
            <WeeklyCalendarBeta
              apiBase={`${API_BASE}/api/weekly`}
              authHeader={authHeader}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ActionsPanel() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  // POST
  const [pTitulo, setPTitulo] = useState('Publicación del día');
  const [pTags, setPTags] = useState('#IA,#RecursosWeb');

  // CARRUSEL
  const [cLimit, setCLimit] = useState(5);
  const [cTitulo, setCTitulo] = useState('Selección del día');
  const [cTags, setCTags] = useState('#IA,#RecursosWeb');

  // REEL
  const [rLimit, setRLimit] = useState(6);
  const [rPerSlide, setRPerSlide] = useState(4);
  const [rTitulo, setRTitulo] = useState('Highlights del día');
  const [rTags, setRTags] = useState('#IA,#RecursosWeb');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const postJSON = async (path, body) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify(body || {}),
    });
    const text = await res.text();
    let payload = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {}
    if (!res.ok)
      throw new Error(
        payload?.error || payload?.message || `${res.status} ${res.statusText} – ${text.slice(0, 120)}`
      );
    return payload ?? {};
  };

  // Post con fallback GET si tu backend lo requiere (405)
  const runPost = async () => {
    setBusy(true);
    setMsg('');
    try {
      const tags = pTags.split(',').map((s) => s.trim()).filter(Boolean);
      let res = await fetch(`${API_BASE}/api/instagram/publish-one`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ account: IG_ALIAS, titulo: pTitulo, tagsExtra: tags }),
      });
      let text = await res.text();
      let payload = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch {}
      if (res.status === 405) {
        const url = `${API_BASE}/api/instagram/publish-one?account=${encodeURIComponent(IG_ALIAS)}`;
        res = await fetch(url, { headers: { ...authHeader } });
        text = await res.text();
        try {
          payload = text ? JSON.parse(text) : null;
        } catch {}
      }
      if (!res.ok)
        throw new Error(
          payload?.error || payload?.message || `${res.status} ${res.statusText} – ${text.slice(0, 120)}`
        );
      setMsg(`✅ Post lanzado. postId=${payload?.igMediaId || payload?.postId || 'N/A'}`);
      window.dispatchEvent(new Event('ig-refresh'));
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const runCarousel = async () => {
    setBusy(true);
    setMsg('');
    try {
      const tags = cTags.split(',').map((s) => s.trim()).filter(Boolean);
      const out = await postJSON('/api/instagram/publish-carousel-one', {
        limit: Number(cLimit) || 5,
        titulo: cTitulo,
        tagsExtra: tags,
      });
      setMsg(`✅ Carrusel lanzado. postId=${out?.igMediaId || 'N/A'}`);
      window.dispatchEvent(new Event('ig-refresh'));
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const runReel = async () => {
    setBusy(true);
    setMsg('');
    try {
      const tags = rTags.split(',').map((s) => s.trim()).filter(Boolean);
      const out = await postJSON('/api/instagram/publish-reel-one', {
        limit: Number(rLimit) || 6,
        perSlideSec: Number(rPerSlide) || 4,
        titulo: rTitulo,
        tagsExtra: tags,
      });
      setMsg(`✅ Reel lanzado. postId=${out?.igMediaId || 'N/A'}`);
      window.dispatchEvent(new Event('ig-refresh'));
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="igact">
      <div className="igact__head">
        <div className="igact__title">Acciones rápidas</div>
        <button className="igact__btn" onClick={() => setMsg('')} disabled={busy}>
          Limpiar
        </button>
      </div>

      {msg ? (
        <div className={`igact__alert ${msg.startsWith('✅') ? 'igact__alert--ok' : 'igact__alert--err'}`}>
          {msg}
        </div>
      ) : null}

      <div className="igact__grid">
        {/* POST */}
        <div className="igact__card">
          <div className="igact__cardTitle">Publicar post</div>
          <div className="igact__row">
            <label className="igact__label">Título</label>
            <input className="igact__input" type="text" value={pTitulo} onChange={(e) => setPTitulo(e.target.value)} />
          </div>
          <div className="igact__row">
            <label className="igact__label">Tags extra</label>
            <input
              className="igact__input"
              type="text"
              placeholder="#tag1,#tag2"
              value={pTags}
              onChange={(e) => setPTags(e.target.value)}
            />
          </div>
          <button className="igact__btn igact__btn--primary" onClick={runPost} disabled={busy}>
            {busy ? 'Lanzando…' : 'Publicar post'}
          </button>
        </div>

        {/* CARRUSEL */}
        <div className="igact__card">
          <div className="igact__cardTitle">Publicar carrusel</div>
          <div className="igact__row">
            <label className="igact__label">Imágenes</label>
            <input
              className="igact__input"
              type="number"
              min="2"
              max="10"
              value={cLimit}
              onChange={(e) => setCLimit(e.target.value)}
            />
          </div>
          <div className="igact__row">
            <label className="igact__label">Título</label>
            <input className="igact__input" type="text" value={cTitulo} onChange={(e) => setCTitulo(e.target.value)} />
          </div>
          <div className="igact__row">
            <label className="igact__label">Tags extra</label>
            <input
              className="igact__input"
              type="text"
              placeholder="#tag1,#tag2"
              value={cTags}
              onChange={(e) => setCTags(e.target.value)}
            />
          </div>
          <button className="igact__btn igact__btn--primary" onClick={runCarousel} disabled={busy}>
            {busy ? 'Lanzando…' : 'Publicar carrusel'}
          </button>
        </div>

        {/* REEL */}
        <div className="igact__card">
          <div className="igact__cardTitle">Publicar reel</div>
          <div className="igact__row">
            <label className="igact__label">Imágenes</label>
            <input
              className="igact__input"
              type="number"
              min="2"
              max="20"
              value={rLimit}
              onChange={(e) => setRLimit(e.target.value)}
            />
          </div>
          <div className="igact__row">
            <label className="igact__label">Seg/imagen</label>
            <input
              className="igact__input"
              type="number"
              min="2"
              max="10"
              value={rPerSlide}
              onChange={(e) => setRPerSlide(e.target.value)}
            />
          </div>
          <div className="igact__row">
            <label className="igact__label">Título</label>
            <input className="igact__input" type="text" value={rTitulo} onChange={(e) => setRTitulo(e.target.value)} />
          </div>
          <div className="igact__row">
            <label className="igact__label">Tags extra</label>
            <input
              className="igact__input"
              type="text"
              placeholder="#tag1,#tag2"
              value={rTags}
              onChange={(e) => setRTags(e.target.value)}
            />
          </div>
          <button className="igact__btn igact__btn--primary" onClick={runReel} disabled={busy}>
            {busy ? 'Lanzando…' : 'Publicar reel'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* estilos */
const styles = {
  wrap: { padding: '16px' },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    padding: 16,
    boxShadow: '0 1px 2px rgba(0,0,0,.03)',
  },
  title: { margin: 0, fontSize: 20, fontWeight: 700 },
  muted: { color: '#6b7280', marginTop: 6 },
};

const css = `
.tabs { display:flex; gap:8px; margin:10px 0 6px; }
.tab { background:#f3f4f6; border:1px solid #e5e7eb; border-radius:8px; padding:8px 12px; cursor:pointer; }
.tab--active { background:#111; color:#fff; border-color:#111; }

.igact { margin-top: 16px; border:1px solid #e5e7eb; border-radius:14px; padding:14px; }
.igact__head { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px; }
.igact__title { font-weight:600; }
.igact__btn { background:#111; color:#fff; border:0; border-radius:10px; padding:8px 12px; font-size:13px; cursor:pointer; }
.igact__btn:hover { background:#222; }
.igact__btn:disabled { opacity:.6; cursor:not-allowed; }
.igact__btn--primary { margin-top:10px; }
.igact__alert { margin-bottom:10px; border:1px solid; border-radius:10px; padding:8px 12px; font-size:13px; }
.igact__alert--ok { background:#ecfdf5; color:#047857; border-color:#a7f3d0; }
.igact__alert--err { background:#fff2f2; color:#b30000; border-color:#f5c2c2; }
.igact__grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(260px,1fr)); gap:12px; }
.igact__card { border:1px solid #e5e7eb; border-radius:12px; padding:12px; }
.igact__cardTitle { font-weight:600; margin-bottom:8px; }
.igact__row { display:grid; grid-template-columns: 120px 1fr; align-items:center; gap:10px; margin:6px 0; }
.igact__label { font-size:13px; color:#374151; }
.igact__input { width:100%; border:1px solid #e5e7eb; border-radius:8px; padding:8px; font-size:13px; }
`;
