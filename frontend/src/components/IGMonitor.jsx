import { useCallback, useEffect, useMemo, useState } from 'react';

// Usa EXACTAMENTE la var del .env del frontend
const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');

async function jsonOrThrow(res){
  const text = await res.text();
  if(!res.ok) throw new Error(`${res.status} ${res.statusText} – ${text.slice(0,120)}`);
  const ct = res.headers.get('content-type') || '';
  if(!ct.includes('application/json')) throw new Error(`Respuesta no JSON (${ct}). ${text.slice(0,120)}`);
  return JSON.parse(text);
}

export default function IGMonitor({ refreshMs = 30000 }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [eligible, setEligible] = useState([]);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    if (!API_BASE) {
      setError('REACT_APP_API_URL no está definido en el frontend.');
      setLoading(false);
      return;
    }
    try {
      setError('');
      setLoading(true);
      const [s, r, e] = await Promise.all([
        fetch(`${API_BASE}/api/instagram/monitor/summary`).then(jsonOrThrow),
        fetch(`${API_BASE}/api/instagram/monitor/recent?limit=15`).then(jsonOrThrow),
        fetch(`${API_BASE}/api/instagram/monitor/eligible?limit=30`).then(jsonOrThrow),
      ]);
      setSummary(s);
      setRecent(Array.isArray(r) ? r : []);
      setEligible(Array.isArray(e) ? e : []);
    } catch (err) {
      setError(err?.message || 'Error cargando monitor');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial + auto-refresh + evento "ig-refresh"
  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, refreshMs);
    const onRefresh = () => fetchAll();
    window.addEventListener('ig-refresh', onRefresh);
    return () => { clearInterval(t); window.removeEventListener('ig-refresh', onRefresh); };
  }, [fetchAll, refreshMs]); // ✅ ya no hay warning de dependencias

  const counts = useMemo(() => ({
    publishable: summary?.counts?.publishable ?? 0,
    publishedTotal: summary?.counts?.publishedTotal ?? 0,
    publishedToday: summary?.counts?.publishedToday ?? 0,
    published7d: summary?.counts?.published7d ?? 0,
    eligibleForReel: summary?.counts?.eligibleForReel ?? 0,
  }), [summary]);

  return (
    <>
      <style>{css}</style>

      <div className="igmon">
        <div className="igmon__header">
          <h1 className="igmon__title">
            Instagram Monitor — {summary?.account || '…'}
          </h1>
          <button
            className="igmon__btn"
            onClick={fetchAll}
            disabled={loading}
            title="Actualizar ahora"
          >
            {loading ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>

        {error ? <div className="igmon__alert">{error}</div> : null}

        {/* Top stats */}
        <div className="igmon__stats">
          <Card title="Publicables" value={counts.publishable} hint="Imágenes publishable:true sin publicar" />
          <Card title="Publicadas (total)" value={counts.publishedTotal} />
          <Card title="Hoy" value={counts.publishedToday} />
          <Card title="Últimos 7 días" value={counts.published7d} />
          <Card title="Elegibles Reel (>=2)" value={counts.eligibleForReel} />
        </div>

        {/* Scheduler */}
        <div className="igmon__panel">
          <div className="igmon__panelHead">
            <div className="igmon__panelTitle">Scheduler</div>
            <span className={'igmon__badge ' + (summary?.scheduler?.enabled ? 'igmon__badge--ok' : 'igmon__badge--off')}>
              {summary?.scheduler?.enabled ? 'enabled' : 'disabled'}
            </span>
          </div>
          <div className="igmon__grid3">
            <div><span className="igmon__label">Modo:</span> {summary?.scheduler?.mode || '–'}</div>
            <div><span className="igmon__label">Ventana:</span> {summary?.scheduler?.windowStart} – {summary?.scheduler?.windowEnd}</div>
            <div><span className="igmon__label">TZ:</span> Europe/Madrid</div>
          </div>
        </div>

        {/* Recent publications */}
        <div className="igmon__panel">
          <div className="igmon__panelTitle">Últimas publicaciones</div>
          <div className="igmon__list">
            {recent.length === 0 ? (
              <div className="igmon__muted">{loading ? 'Cargando…' : 'Sin publicaciones registradas para esta cuenta.'}</div>
            ) : recent.map((row) => (
              <div className="igmon__listItem" key={`${row._id}-${row.postId}`}>
                <ImgThumb src={row.previewUrl || row.finalUrl} alt={row.filename} />
                <div className="igmon__listBody">
                  <div className="igmon__row">
                    <span className="igmon__strong">{formatDateTime(row.postedAt)}</span>
                    <span className="igmon__dot">•</span>
                    <span className="igmon__mono">postId: {row.postId}</span>
                  </div>
                  <div className="igmon__subtle">{row.finalUrl}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eligible gallery */}
        <div className="igmon__panel">
          <div className="igmon__panelTitle">Elegibles (no publicados todavía)</div>
          {eligible.length === 0 ? (
            <div className="igmon__muted">{loading ? 'Cargando…' : 'No hay material elegible ahora mismo.'}</div>
          ) : (
            <div className="igmon__gallery">
              {eligible.map((img) => (
                <a key={img._id} href={img.finalUrl} target="_blank" rel="noreferrer" className="igmon__thumbLink" title="Abrir imagen">
                  <img src={img.finalUrl} className="igmon__thumb" alt="" loading="lazy" />
                  <div className="igmon__thumbHint">{formatDate(img.createdAt)}</div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Card({ title, value, hint }) {
  return (
    <div className="igmon__card">
      <div className="igmon__cardTitle">{title}</div>
      <div className="igmon__cardValue">{value}</div>
      {hint ? <div className="igmon__cardHint">{hint}</div> : null}
    </div>
  );
}

function ImgThumb({ src, alt }) {
  return <img src={src} alt={alt || 'img'} className="igmon__thumbSmall" loading="lazy" />;
}

/* helpers */
function pad(n) { return n.toString().padStart(2, '0'); }
function formatDateTime(d) {
  const date = new Date(d);
  const dd = [pad(date.getDate()), pad(date.getMonth() + 1), date.getFullYear()].join('/');
  const hh = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return `${dd} ${hh}`;
}
function formatDate(d) {
  const date = new Date(d);
  return [pad(date.getDate()), pad(date.getMonth() + 1), date.getFullYear()].join('/');
}

/* CSS embebido */
const css = `
.igmon { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Helvetica Neue"; color:#111; }
.igmon__header { display:flex; align-items:center; justify-content:space-between; gap:12px; margin: 8px 0 16px; }
.igmon__title { margin:0; font-size:20px; font-weight:700; }
.igmon__btn { background:#111; color:#fff; border:0; border-radius:10px; padding:8px 12px; font-size:13px; cursor:pointer; }
.igmon__btn:hover { background:#222; }
.igmon__btn:disabled { opacity:.6; cursor:not-allowed; }
.igmon__alert { background:#fff2f2; color:#b30000; border:1px solid #f5c2c2; border-radius:8px; padding:10px 12px; font-size:14px; }

.igmon__stats { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:12px; margin:16px 0; }
@media (min-width: 768px) { .igmon__stats { grid-template-columns: repeat(5, minmax(0,1fr)); } }

.igmon__card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:12px; box-shadow: 0 1px 2px rgba(0,0,0,.03); }
.igmon__cardTitle { font-size:12px; color:#6b7280; }
.igmon__cardValue { margin-top:4px; font-size:22px; font-weight:700; }
.igmon__cardHint { margin-top:4px; font-size:11px; color:#9ca3af; }

.igmon__panel { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:14px; box-shadow: 0 1px 2px rgba(0,0,0,.03); margin: 14px 0; }
.igmon__panelHead { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px; }
.igmon__panelTitle { font-weight:600; }
.igmon__badge { font-size:11px; padding:2px 8px; border-radius:8px; border:1px solid transparent; }
.igmon__badge--ok  { background:#ecfdf5; color:#047857; border-color:#a7f3d0; }
.igmon__badge--off { background:#f3f4f6; color:#6b7280; border-color:#e5e7eb; }
.igmon__grid3 { display:grid; grid-template-columns: 1fr; gap:8px; color:#4b5563; font-size:14px; }
@media (min-width: 640px) { .igmon__grid3 { grid-template-columns: repeat(3, 1fr); } }
.igmon__label { font-weight:600; color:#111; }

.igmon__list { display:flex; flex-direction:column; gap:12px; }
.igmon__listItem { display:flex; gap:12px; padding-bottom:12px; border-bottom:1px solid #e5e7eb; }
.igmon__thumbSmall { width:64px; height:64px; object-fit:cover; border-radius:8px; border:1px solid #e5e7eb; }
.igmon__listBody { flex:1; min-width:0; }
.igmon__row { font-size:13px; color:#374151; }
.igmon__strong { font-weight:600; color:#111; }
.igmon__dot { margin:0 8px; color:#9ca3af; }
.igmon__mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; color:#374151; }
.igmon__subtle { font-size:12px; color:#9ca3af; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

.igmon__muted { font-size:14px; color:#6b7280; }
.igmon__gallery { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:10px; }
@media (min-width: 640px) { .igmon__gallery { grid-template-columns: repeat(3, minmax(0,1fr)); } }
@media (min-width: 960px) { .igmon__gallery { grid-template-columns: repeat(6, minmax(0,1fr)); } }
.igmon__thumbLink { text-decoration:none; color:inherit; }
.igmon__thumb { width:100%; height:112px; object-fit:cover; border-radius:10px; border:1px solid #e5e7eb; display:block; }
.igmon__thumbLink:hover .igmon__thumb { opacity:.95; }
.igmon__thumbHint { margin-top:4px; font-size:11px; color:#6b7280; }
`;
