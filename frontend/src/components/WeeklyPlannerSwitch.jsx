import React, { useEffect, useMemo, useState } from 'react';

// Misma base que usas en el resto del front
const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');

export default function WeeklyPlannerSwitch() {
  // Auth header (si estás logueado con token)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [tz, setTz] = useState('');
  const [msg, setMsg] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState('');

  // Cargar estado planner + cuentas
  useEffect(() => {
    (async () => {
      try {
        const [st, acc] = await Promise.all([
          fetch(`${API_BASE}/api/weekly/status`, { credentials: 'include', headers: { ...authHeader } }),
          fetch(`${API_BASE}/api/weekly/accounts`, { credentials: 'include', headers: { ...authHeader } }),
        ]);
        const stJson = await st.json().catch(() => ({}));
        const accJson = await acc.json().catch(() => []);
        setEnabled(!!stJson.enabled);
        setTz(stJson.tz || '');
        setAccounts(Array.isArray(accJson) ? accJson : []);
        if (Array.isArray(accJson) && accJson.length && !accountId) {
          setAccountId(accJson[0]._id);
        }
      } catch (e) {
        setMsg(`⚠️ No se pudo leer estado/ cuentas: ${e.message}`);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE]); // authHeader no suele cambiar; evitamos warn por deps

  const callJSON = async (path, body) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      credentials: 'include',
      body: JSON.stringify(body || {}),
    });
    const text = await res.text();
    let json = null; try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }
    if (!res.ok) {
      const msg = json?.error || json?.message || `${res.status} ${res.statusText}`;
      throw new Error(msg);
    }
    return json ?? {};
  };

  const togglePlanner = async (want) => {
    setLoading(true); setMsg('');
    try {
      await callJSON('/api/weekly/toggle', { enabled: want });
      setEnabled(want);
      setMsg(want ? '✅ Planner activado' : '🛑 Planner desactivado');
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const rebuildAll = async () => {
    setLoading(true); setMsg('');
    try {
      await callJSON('/api/weekly/rebuild-all', {});
      setMsg(`✅ Rebuild global OK`);
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const rebuildAccount = async () => {
    if (!accountId) { setMsg('⚠️ Selecciona una cuenta'); return; }
    setLoading(true); setMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/weekly/rebuild/${accountId}`, {
        method: 'POST',
        headers: { ...authHeader },
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      setMsg('✅ Rebuild de la cuenta OK');
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runNowPost = async () => {
    if (!accountId) { setMsg('⚠️ Selecciona una cuenta'); return; }
    setLoading(true); setMsg('');
    try {
      const out = await callJSON(`/api/weekly/run-now/${accountId}`, { type: 'post', dryRun: false });
      setMsg(`✅ run-now post OK (alias=${out?.alias || 'N/A'})`);
      // dispara refresh global del monitor si lo tienes escuchando
      window.dispatchEvent(new Event('ig-refresh'));
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openDiagnose = () => {
    if (!accountId) { setMsg('⚠️ Selecciona una cuenta'); return; }
    const url = `${API_BASE}/api/weekly/diagnose/${accountId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="wps">
      <style>{css}</style>

      <div className="wps__head">
        <div className="wps__title">Planner semanal</div>
        <div className={`wps__chip ${enabled ? 'wps__chip--on' : 'wps__chip--off'}`}>
          {enabled ? 'ON' : 'OFF'}
        </div>
      </div>

      <div className="wps__row">
        <div className="wps__label">Zona horaria</div>
        <div className="wps__value">{tz || '—'}</div>
      </div>

      <div className="wps__row">
        <div className="wps__label">Cuenta</div>
        <div className="wps__value">
          <select
            className="wps__select"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            {accounts.map(acc => (
              <option key={acc._id} value={acc._id}>
                {acc.alias} — {acc.timezone || 'Europe/Madrid'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {msg ? (
        <div className={`wps__alert ${msg.startsWith('✅') ? 'wps__alert--ok' : (msg.startsWith('🛑') || msg.startsWith('⚠️')) ? 'wps__alert--warn' : 'wps__alert--err'}`}>
          {msg}
        </div>
      ) : null}

      <div className="wps__grid">
        <button className="wps__btn" disabled={loading || enabled} onClick={() => togglePlanner(true)}>
          {loading && !enabled ? 'Activando…' : 'Activar planner'}
        </button>
        <button className="wps__btn" disabled={loading || !enabled} onClick={() => togglePlanner(false)}>
          {loading && enabled ? 'Desactivando…' : 'Desactivar planner'}
        </button>
        <button className="wps__btn wps__btn--ghost" disabled={loading || !enabled} onClick={rebuildAll}>
          Rebuild global
        </button>
        <button className="wps__btn wps__btn--ghost" disabled={loading || !enabled || !accountId} onClick={rebuildAccount}>
          Rebuild cuenta
        </button>
        <button className="wps__btn wps__btn--ghost" disabled={loading || !enabled || !accountId} onClick={runNowPost}>
          Run-now (post)
        </button>
        <button className="wps__btn wps__btn--ghost" disabled={!accountId} onClick={openDiagnose}>
          Ver diagnose
        </button>
      </div>
    </div>
  );
}

const css = `
.wps { border:1px solid #e5e7eb; border-radius:14px; padding:14px; margin-top:16px; }
.wps__head { display:flex; align-items:center; justify-content:space-between; }
.wps__title { font-weight:700; font-size:16px; }
.wps__chip { padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700; color:#fff; }
.wps__chip--on { background:#059669; }
.wps__chip--off { background:#b91c1c; }
.wps__row { display:grid; grid-template-columns: 140px 1fr; gap:10px; align-items:center; margin-top:10px; }
.wps__label { color:#374151; font-size:13px; }
.wps__value { font-size:13px; }
.wps__select { border:1px solid #e5e7eb; border-radius:8px; padding:8px; min-width: 260px; }
.wps__grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap:10px; margin-top:14px; }
.wps__btn { background:#111; color:#fff; border:0; border-radius:10px; padding:10px 12px; font-size:13px; cursor:pointer; }
.wps__btn:disabled { opacity:.6; cursor:not-allowed; }
.wps__btn--ghost { background:#fff; color:#111; border:1px solid #e5e7eb; }
.wps__alert { margin-top:12px; border:1px solid; border-radius:10px; padding:8px 12px; font-size:13px; }
.wps__alert--ok { background:#ecfdf5; color:#047857; border-color:#a7f3d0; }
.wps__alert--warn { background:#fff7ed; color:#9a3412; border-color:#fed7aa; }
.wps__alert--err { background:#fff2f2; color:#b30000; border-color:#f5c2c2; }
`;
