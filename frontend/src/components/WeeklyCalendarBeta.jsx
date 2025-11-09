import React, { useEffect, useMemo, useState } from 'react';

const DAYS = [
  { key: 'mon', label: 'L' }, { key: 'tue', label: 'M' }, { key: 'wed', label: 'X' },
  { key: 'thu', label: 'J' }, { key: 'fri', label: 'V' }, { key: 'sat', label: 'S' }, { key: 'sun', label: 'D' },
];
const TYPES = [
  { key: 'post', label: 'Post' }, { key: 'carousel', label: 'Carrusel' }, { key: 'reel', label: 'Reel' },
];

// normaliza respuestas que podrían ser: array directo, {accounts:[]}, {data:[]}, null, 204...
function toArray(maybe) {
  if (Array.isArray(maybe)) return maybe;
  if (maybe && Array.isArray(maybe.accounts)) return maybe.accounts;
  if (maybe && Array.isArray(maybe.data)) return maybe.data;
  return [];
}

export default function WeeklyCalendarBeta({ apiBase, authHeader = {} }) {
  const API = useMemo(() => (apiBase || '/api/weekly').replace(/\/+$/, ''), [apiBase]);
  const stableAuth = authHeader;

  const [accounts, setAccounts] = useState([]);        // siempre array
  const [accLoading, setAccLoading] = useState(true);
  const [accError, setAccError] = useState('');

  const [accountId, setAccountId] = useState('');      // id seleccionado

  const [data, setData] = useState(null);
  const [schedLoading, setSchedLoading] = useState(false);
  const [schedError, setSchedError] = useState('');

  const [saving, setSaving] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);

  // Carga cuentas
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setAccLoading(true); setAccError('');
      try {
        const res = await fetch(`${API}/accounts`, { headers: { 'Content-Type': 'application/json', ...stableAuth } });
        if (res.status === 204) {
          if (!cancelled) { setAccounts([]); setAccountId(''); }
          return;
        }
        const text = await res.text();
        const json = text ? JSON.parse(text) : null;
        const list = toArray(json);
        if (!cancelled) {
          setAccounts(list);
          setAccountId(prev => prev || (list[0]?._id || ''));
        }
      } catch (e) {
        if (!cancelled) {
          setAccError(e?.message || 'Error cargando cuentas');
          setAccounts([]); setAccountId('');
        }
      } finally {
        if (!cancelled) setAccLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [API, stableAuth]);

  // Carga schedule de la cuenta seleccionada
  useEffect(() => {
    if (!accountId) { setData(null); return; }
    let cancelled = false;
    async function loadSched() {
      setSchedLoading(true); setSchedError('');
      try {
        const res = await fetch(`${API}/schedule/${accountId}`, { headers: { 'Content-Type': 'application/json', ...stableAuth } });
        if (res.status === 204) { if (!cancelled) setData({ post:{}, carousel:{}, reel:{} }); return; }
        const text = await res.text();
        const json = text ? JSON.parse(text) : null;
        if (!cancelled) setData(json || { post:{}, carousel:{}, reel:{} });
      } catch (e) {
        if (!cancelled) {
          setSchedError(e?.message || 'Error cargando configuración');
          setData({ post:{}, carousel:{}, reel:{} });
        }
      } finally {
        if (!cancelled) setSchedLoading(false);
      }
    }
    loadSched();
    return () => { cancelled = true; };
  }, [API, accountId, stableAuth]);

  function toggle(type, day, enabled) {
    setData(prev => ({
      ...prev,
      [type]: {
        ...(prev?.[type] || {}),
        [day]: enabled
          ? { enabled: true, time: prev?.[type]?.[day]?.time || '10:00' }
          : { enabled: false, time: '' },
      },
    }));
  }

  function setTime(type, day, time) {
    setData(prev => ({
      ...prev,
      [type]: { ...(prev?.[type] || {}), [day]: { enabled: true, time } },
    }));
  }

  async function save() {
    if (!accountId) return;
    setSaving(true);
    try {
      await fetch(`${API}/schedule/${accountId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...stableAuth },
        body: JSON.stringify({
          post: data?.post || {},
          carousel: data?.carousel || {},
          reel: data?.reel || {},
          source: 'weekly',
        }),
      });
    } finally {
      setSaving(false);
    }
  }

  async function rebuild() {
    if (!accountId) return;
    setRebuilding(true);
    try {
      await fetch(`${API}/rebuild/${accountId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...stableAuth },
      });
    } finally {
      setRebuilding(false);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      {/* Selector de cuenta */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        <label>Cuenta:</label>
        {accLoading ? (
          <span>Cargando cuentas…</span>
        ) : accError ? (
          <span style={{ color: '#b30000' }}>{accError}</span>
        ) : accounts.length === 0 ? (
          <span style={{ color: '#6b7280' }}>No hay cuentas disponibles</span>
        ) : (
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a._id} value={a._id}>
                {a.alias} ({a.timezone})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Contenido del calendario */}
      {!accountId ? (
        <div style={{ color: '#6b7280' }}>Selecciona una cuenta para configurar su calendario.</div>
      ) : schedLoading ? (
        <div>Cargando configuración…</div>
      ) : schedError ? (
        <div style={{ color: '#b30000' }}>{schedError}</div>
      ) : !data ? (
        <div style={{ color: '#6b7280' }}>Sin datos de calendario.</div>
      ) : (
        <>
          {TYPES.map((t) => (
            <div key={t.key} style={{ margin: '16px 0' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{t.label}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                {DAYS.map((d) => {
                  const val = data?.[t.key]?.[d.key] || { enabled: false, time: '' };
                  return (
                    <div key={d.key} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <b>{d.label}</b>
                        <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={!!val.enabled}
                            onChange={(e) => toggle(t.key, d.key, e.target.checked)}
                          />
                          <span style={{ fontSize: 12 }}>{val.enabled ? 'ON' : 'OFF'}</span>
                        </label>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <input
                          type="time"
                          value={val.time || ''}
                          disabled={!val.enabled}
                          onChange={(e) => setTime(t.key, d.key, e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={save} disabled={saving || !accountId}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
            <button onClick={rebuild} disabled={rebuilding || !accountId}>
              {rebuilding ? 'Aplicando…' : 'Aplicar al planificador'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
