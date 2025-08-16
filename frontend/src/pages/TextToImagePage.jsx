// src/pages/TextToImagePage.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { startText2Image, getImageStatus, listMyRecentImages } from '../services/text2imageApi';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

// --- Constantes y Configuración ---
const RATIOS = ['1:1', '2:3', '3:2', '3:4', '4:3', '16:9', '9:16'];
const DEFAULT_STEPS = 10;

// Opciones LoRA (con soporte de carpeta/archivo)
const LORA_OPTIONS = [
  {
    key: 'aidmaHyperrealism',
    label: 'Aidma Hyperrealism (FLUX v0.3)',
    folder: '',
    filename: 'aidmaHyperrealism-FLUX-v0.3.safetensors',
    trigger: 'aidmaHyperrealism',
    defaultStrengthModel: 0.7,
    defaultStrengthClip: 1.0,
  },
  {
    key: 'designtshirt',
    label: 'T-Shirt Design',
    folder: '',
    filename: 'Graphic_T-Shirts.safetensors',
    trigger: 'Graphic T-Shirt',
    defaultStrengthModel: 1.0,
    defaultStrengthClip: 1.0,
    examples: [
      'A graphic t-shirt design of a sultry female tree frog wearing a bikini, red lipstick, and mirrored sunglasses that reads "You Lookin At Me?"',
      'A graphic t-shirt design of a sloth surfing a giant wave in Costa Rica that reads "Surf Costa Rica" on a black background'
    ],
  },
  {
    key: 'designtshirt_plus',
    label: 'T-Shirt Design Marvel',
    folder: '',
    filename: 'd3s1gntsh1rt-designtshirt-flux.safetensors',
    trigger: 'd3s1gntsh1rt',
    defaultStrengthModel: 1.0,
    defaultStrengthClip: 1.0,
  },
];

// --- Helpers (antes de los componentes que los usan) ---
const unwrapStatus = (resp) => {
  if (!resp || typeof resp !== 'object') return resp;
  if ('status' in resp || 'estado' in resp || 'progress' in resp) return resp;
  if (resp.data && typeof resp.data === 'object') return resp.data;
  if (resp.result && typeof resp.result === 'object') return resp.result;
  if (resp.payload && typeof resp.payload === 'object') return resp.payload;
  return resp;
};

const parseProgress = (raw) => {
  const pick = (v) => {
    if (v === undefined || v === null) return null;
    if (typeof v === 'string') {
      const m = v.match(/(\d+(?:\.\d+)?)/);
      return m ? Number(m[1]) : null;
    }
    if (typeof v === 'number') return v;
    return null;
  };

  const direct =
    pick(raw?.progress) ??
    pick(raw?.porcentaje) ??
    pick(raw?.percentage) ??
    pick(raw?.progreso) ??
    pick(raw?.meta?.progress);

  if (direct !== null && Number.isFinite(direct)) {
    return Math.max(0, Math.min(100, Math.round(direct)));
  }

  const cur = Number(raw?.currentStep ?? raw?.step ?? raw?.stepsDone);
  const tot = Number(raw?.totalSteps ?? raw?.stepsTotal ?? raw?.steps);
  if (Number.isFinite(cur) && Number.isFinite(tot) && tot > 0) {
    return Math.max(0, Math.min(100, Math.round((cur / tot) * 100)));
  }
  return null;
};

const fmtSeconds = (s) => {
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return mm > 0 ? `${mm}m ${String(ss).padStart(2,'0')}s` : `${ss}s`;
};

// --- UI Auxiliar ---
const InlineAlert = ({ message, onLogin }) => {
  if (!message) return null;
  return (
    <div
      style={{
        margin: '0 0 1rem',
        padding: '0.75rem 1rem',
        borderRadius: 8,
        border: '1px solid #ef4444',
        background: 'rgba(239,68,68,.08)',
        color: '#fecaca',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <span>⚠️ {message}</span>
      <button
        onClick={onLogin}
        style={{
          background: '#ef4444',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '0.5rem .85rem',
          cursor: 'pointer'
        }}
      >
        Iniciar sesión
      </button>
    </div>
  );
};

// --- Iconos SVG ---
const IconLoader = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       className="spinner">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const IconSparkles = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);

// --- Componentes de UI ---
const FormField = ({ label, children, hint }) => (
  <div className="form-field">
    <label>{label}</label>
    {children}
    {hint ? <small className="hint">{hint}</small> : null}
  </div>
);

/* =========================
   Modal de imagen (nuevo)
   ========================= */
function ImageModal({ open, images, index, onClose, onPrev, onNext }) {
  const item = images?.[index];

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, onPrev, onNext]);

  if (!open || !item) return null;

  const cfg = item.params || {};
  const lora = cfg.lora || null;

  const strengthModel = (lora?.strength_model ?? lora?.strengthModel);
  const strengthClip  = (lora?.strength_clip  ?? lora?.strengthClip);
  const loraName      = lora?.name || lora?.model || null;
  const loraTrigger   = lora?.trigger || null;

  const ratio = cfg.ratio ?? '—';
  const steps = cfg.steps ?? '—';
  const seed  = (cfg.seed ?? cfg.random_seed ?? null);
  const fecha = item.createdAt || item.updatedAt || item.date || item.fecha || null;
  const fechaFmt = fecha ? new Date(fecha).toLocaleString() : '—';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-header">
          <strong>Vista previa</strong>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <img src={item.url} alt="preview" />

          <div className="modal-meta">
            {/* Prompt */}
            <div className="meta-row">
              <div className="meta-title">Prompt</div>
              <div className="meta-actions">
                <button className="btn subtle" onClick={() => navigator.clipboard.writeText(item.prompt || '')}>
                  Copiar
                </button>
              </div>
            </div>
            <div className="modal-prompt">{item.prompt || '—'}</div>

            {/* Detalles clave */}
            <div className="meta-row" style={{marginTop:'.75rem'}}>
              <div className="meta-title">Detalles</div>
            </div>

            <div className="info-list">
              <div className="info-item">
                <span className="k">Fecha</span>
                <span className="v">{fechaFmt}</span>
              </div>
              <div className="info-item">
                <span className="k">Proporción</span>
                <span className="v">{ratio}</span>
              </div>
              <div className="info-item">
                <span className="k">Pasos</span>
                <span className="v">{steps}</span>
              </div>
              {seed !== null && (
                <div className="info-item">
                  <span className="k">Seed</span>
                  <span className="v">{String(seed)}</span>
                </div>
              )}

              {/* LoRA si existe */}
              {lora && (
                <>
                  <div className="info-item">
                    <span className="k">LoRA</span>
                    <span className="v">{loraName || '—'}</span>
                  </div>
                  {loraTrigger && (
                    <div className="info-item">
                      <span className="k">Trigger</span>
                      <span className="v">{loraTrigger}</span>
                    </div>
                  )}
                  {strengthModel !== undefined && (
                    <div className="info-item">
                      <span className="k">Strength (modelo)</span>
                      <span className="v">{String(strengthModel)}</span>
                    </div>
                  )}
                  {strengthClip !== undefined && (
                    <div className="info-item">
                      <span className="k">Strength (CLIP)</span>
                      <span className="v">{String(strengthClip)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onPrev}>&larr; Anterior</button>
          <a href={item.url} target="_blank" rel="noreferrer">Abrir en nueva pestaña</a>
          <button onClick={onNext}>Siguiente &rarr;</button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Biblioteca de imágenes (nuevo)
   ========================= */
function UserImageLibrary({ isLogged, onNeedLogin, refreshSignal }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest'); // 'newest' | 'oldest'
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchImages = useCallback(async () => {
    if (!isLogged) return;
    try {
      setLoading(true);
      setError('');
      const list = await listMyRecentImages(30, 120);
      const filtered = list.filter(it => (it.status || 'completada') === 'completada');
      setImages(filtered);
    } catch (e) {
      console.error(e);
      setError('No se pudo cargar tu biblioteca de imágenes.');
    } finally {
      setLoading(false);
    }
  }, [isLogged]);

  useEffect(() => { fetchImages(); }, [fetchImages]);
  useEffect(() => { if (refreshSignal) fetchImages(); }, [refreshSignal, fetchImages]);

  const filtered = useMemo(() => {
    const byQuery = query.trim()
      ? images.filter(i => (i.prompt || '').toLowerCase().includes(query.toLowerCase()))
      : images;
    const sorted = byQuery.slice().sort((a,b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sort === 'newest' ? (db - da) : (da - db);
    });
    return sorted;
  }, [images, query, sort]);

  const openAt = (idx) => { setActiveIndex(idx); setOpen(true); };
  const close = () => setOpen(false);
  const prev = () => setActiveIndex(i => (i > 0 ? i - 1 : filtered.length - 1));
  const next = () => setActiveIndex(i => (i < filtered.length - 1 ? i + 1 : 0));

  return (
    <section className="library-section" aria-label="Biblioteca de imágenes">
      <div className="library-header">
        <h2>Tu biblioteca (últimos 30 días)</h2>
        {!isLogged ? (
          <button className="btn" onClick={onNeedLogin}>Inicia sesión</button>
        ) : null}
      </div>

      {isLogged && (
        <>
          <div className="library-controls">
            <input
              className="library-search"
              type="text"
              placeholder="Filtrar por texto del prompt…"
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
            />
            <select className="library-sort" value={sort} onChange={(e)=>setSort(e.target.value)}>
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguas</option>
            </select>
            <button className="btn subtle" onClick={fetchImages} disabled={loading}>
              {loading ? 'Actualizando…' : 'Actualizar'}
            </button>
          </div>

          {loading && <div className="library-empty">Cargando tu álbum…</div>}
          {!loading && error && <div className="library-error">⚠️ {error}</div>}

          {!loading && !error && filtered.length === 0 && (
            <div className="library-empty">No hay imágenes en los últimos 30 días.</div>
          )}

          <div className="library-grid">
            {filtered.map((it, idx) => (
              <figure key={it.id} className="library-card" onClick={() => openAt(idx)}>
                <img src={it.url} alt={it.prompt || 'imagen generada'} loading="lazy" />
                <figcaption title={it.prompt || ''}>
                  {(it.prompt || '').slice(0, 80)}
                  {(it.prompt || '').length > 80 ? '…' : ''}
                </figcaption>
              </figure>
            ))}
          </div>

          <ImageModal
            open={open}
            images={filtered}
            index={activeIndex}
            onClose={close}
            onPrev={prev}
            onNext={next}
          />
        </>
      )}
    </section>
  );
}

/* =========================
   LoraControls (completo, sin recortes)
   ========================= */
const LoraControls = ({
  useLora, setUseLora,
  loraKey, setLoraKey,
  loraConfig, setLoraConfig,
  submitting, setPrompt
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const current = useMemo(
    () => LORA_OPTIONS.find(o => o.key === loraKey) || LORA_OPTIONS[0],
    [loraKey]
  );

  useEffect(() => {
    if (!current) return;
    setLoraConfig(prev => ({
      ...prev,
      name: current.folder ? `${current.folder}/${current.filename}` : current.filename,
      trigger: current.trigger,
      strengthModel: current.defaultStrengthModel,
      strengthClip: current.defaultStrengthClip,
    }));
  }, [loraKey]); // eslint-disable-line

  return (
    <div className={`lora-section ${isOpen ? 'open' : ''}`}>
      <div className="lora-header" onClick={() => setIsOpen(!isOpen)}>
        <label className="checkbox-control" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={useLora}
            onChange={(e) => setUseLora(e.target.checked)}
          />
          <strong>Usar LoRA</strong>
        </label>
        <span className="accordion-toggle">{isOpen ? 'Ocultar' : 'Mostrar'}</span>
      </div>

      {isOpen && (
        <div className="lora-body">
          <div className="grid-col-2">
            <FormField label="LoRA">
              <select
                value={loraKey}
                onChange={(e) => setLoraKey(e.target.value)}
                disabled={!useLora || submitting}
              >
                {LORA_OPTIONS.map(opt => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </select>
              <div className="meta-muted">
                <code style={{opacity:.9}}>
                  {current.folder ? `${current.folder}/${current.filename}` : current.filename}
                </code>
              </div>
            </FormField>

            <FormField label="Trigger (automático)">
              <input type="text" value={current?.trigger || ''} readOnly disabled />
            </FormField>
          </div>

          <div className="grid-col-3">
            <FormField label="Strength (modelo)">
              <input
                type="number" min={0} max={1} step={0.05}
                value={loraConfig.strengthModel}
                onChange={(e)=>setLoraConfig(prev => ({ ...prev, strengthModel: e.target.value }))}
                disabled={!useLora || submitting}
              />
            </FormField>
            <FormField label="Strength (CLIP)">
              <input
                type="number" min={0} max={2} step={0.05}
                value={loraConfig.strengthClip}
                onChange={(e)=>setLoraConfig(prev => ({ ...prev, strengthClip: e.target.value }))}
                disabled={!useLora || submitting}
              />
            </FormField>
            <FormField label="Insertar trigger">
              <select
                value={loraConfig.insertMode}
                onChange={(e)=>setLoraConfig(prev => ({ ...prev, insertMode: e.target.value }))}
                disabled={!useLora || submitting}
              >
                <option value="prefix">Al principio</option>
                <option value="suffix">Al final</option>
              </select>
            </FormField>
          </div>

          {Array.isArray(current?.examples) && current.examples.length > 0 && (
            <div className="examples-wrap" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                <strong style={{ fontSize: '.95rem' }}>Ejemplos rápidos</strong>
                <small className="hint">Haz clic para copiar o usar</small>
              </div>

              <ul style={{ display: 'grid', gap: '.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
                {current.examples.map((ex, i) => {
                  const buildWithTrigger = () => {
                    if (!useLora || !current?.trigger) return ex;
                    return loraConfig.insertMode === 'prefix'
                      ? `${current.trigger}, ${ex}`
                      : `${ex}, ${current.trigger}`;
                  };

                  const handleCopy = async () => {
                    const text = buildWithTrigger();
                    try {
                      if (navigator?.clipboard?.writeText) {
                        await navigator.clipboard.writeText(text);
                      } else {
                        const ta = document.createElement('textarea');
                        ta.value = text;
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        document.body.removeChild(ta);
                      }
                    } catch {}
                  };

                  const handleUse = () => {
                    setPrompt(buildWithTrigger());
                  };

                  return (
                    <li key={i} style={{ background: 'rgba(15,23,42,.5)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '.75rem' }}>
                      <div style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <span style={{ flex: 1, color: 'var(--color-text-secondary)' }}>{ex}</span>
                        <div style={{ display: 'flex', gap: '.5rem', whiteSpace: 'nowrap' }}>
                          <button type="button" onClick={handleCopy} disabled={submitting}
                            style={{ padding: '.35rem .6rem', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-primary)', borderRadius: 6, cursor: 'pointer' }}>
                            Copiar
                          </button>
                          <button type="button" onClick={handleUse} disabled={submitting}
                            style={{ padding: '.35rem .6rem', border: 'none', background: 'var(--color-primary)', color: '#fff', borderRadius: 6, cursor: 'pointer' }}>
                            Usar
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

/* =========================
   ControlPanel (completo)
   ========================= */
const ControlPanel = ({
  prompt, setPrompt, ratio, setRatio, steps, setSteps, seed, setSeed,
  randomSeed, setRandomSeed, filenamePrefix, setFilenamePrefix,
  useLora, setUseLora, loraKey, setLoraKey, loraConfig, setLoraConfig,
  onSubmit, canSubmit, canTuneSteps, submitting, progress
}) => (
  <section className="control-panel">
    <FormField label="Prompt">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Un gato astronauta en un sofá de terciopelo, arte digital, épico..."
        rows={8}
      />
    </FormField>

    <div className="grid-col-2">
      <FormField label="Proporción">
        <select value={ratio} onChange={(e) => setRatio(e.target.value)}>
          {RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </FormField>
      <FormField label="Pasos de Inferencia">
        <input
          type="number" min={1} max={60} step={1}
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          disabled={!canTuneSteps || submitting}
        />
        {!canTuneSteps && (
          <small className="hint">
            Disponible solo para cuentas PRO o ADMIN (por defecto: {DEFAULT_STEPS}).
          </small>
        )}
      </FormField>
    </div>

    <div className="grid-col-2">
      <FormField label="Semilla (Seed)">
        <input
          type="number"
          disabled={randomSeed}
          placeholder={randomSeed ? 'Aleatoria' : 'Introduce un número'}
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
        />
      </FormField>
      <div className="checkbox-align-center">
        <label className="checkbox-control">
          <input
            type="checkbox"
            checked={randomSeed}
            onChange={() => setRandomSeed(v => !v)}
          />
          <span>Semilla aleatoria</span>
        </label>
      </div>
    </div>

    <FormField label="Prefijo de archivo de salida">
      <input
        type="text"
        value={filenamePrefix}
        onChange={(e) => setFilenamePrefix(e.target.value)}
        placeholder="mi-creacion"
      />
    </FormField>

    <LoraControls
      useLora={useLora}
      setUseLora={setUseLora}
      loraKey={loraKey}
      setLoraKey={setLoraKey}
      loraConfig={loraConfig}
      setLoraConfig={setLoraConfig}
      submitting={submitting}
      setPrompt={setPrompt}
    />

    <button onClick={onSubmit} disabled={!canSubmit} className="submit-button">
      {submitting ? (
        <>
          <IconLoader />
          {typeof progress === 'number' ? `Generando… ${progress}%` : 'Generando…'}
        </>
      ) : (
        <>
          <IconSparkles />
          Generar Imagen
        </>
      )}
    </button>
  </section>
);

const ImagePreview = ({ status, finalUrl, progress, elapsedSec, queueIndex }) => (
  <section className="preview-panel">
    <div className="image-container">
      {status === 'completada' && finalUrl ? (
        <img src={finalUrl} alt="Resultado de la generación" />
      ) : status === 'en_proceso' ? (
        <div className="placeholder">
          <IconLoader />
          <span>Generando imagen...</span>
          <div className="elapsed">⏱ {fmtSeconds(elapsedSec)}</div>
          {queueIndex !== null && <div className="elapsed">En cola (#{queueIndex})</div>}
          <div className="progress-wrap" aria-label="Progreso">
            <div className="progress-bar" style={{ width: `${(progress ?? 0)}%` }} />
          </div>
          <div className="progress-label">
            {progress !== null ? `${progress}%` : '—'}
          </div>
        </div>
      ) : (
        <div className="placeholder">
          <IconSparkles />
          <span>Tu imagen aparecerá aquí</span>
        </div>
      )}
    </div>
  </section>
);

const StatusDisplay = ({ status, imageId, progress, elapsedSec, queueIndex }) => {
  if (!status) return null;
  return (
    <div className={`status-display status-${status}`}>
      <strong>Estado:</strong> {status.replace('_', ' ')}
      {imageId && <> · <strong>ID:</strong> {imageId}</>}
      {status === 'en_proceso' && (
        <>
          <> · <strong>Progreso:</strong> {progress !== null ? `${progress}%` : '—'}</>
          <> · <strong>Tiempo:</strong> {fmtSeconds(elapsedSec)}</>
          {queueIndex !== null && <> · <strong>Cola:</strong> #{queueIndex}</>}
        </>
      )}
    </div>
  );
};

// --- Componente Principal ---
export default function TextToImagePage() {
  // Estados básicos
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState('1:1');
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [seed, setSeed] = useState('');
  const [randomSeed, setRandomSeed] = useState(true);
  const [filenamePrefix, setFilenamePrefix] = useState('keiko');
  const { user, loading } = useUser() || {};
  const navigate = useNavigate();
  const isLogged = !loading && Boolean(user);
  const role = user?.role || localStorage.getItem('role') || 'free';
  const canTuneSteps = role === 'pro' || role === 'admin';

  // LoRA
  const [useLora, setUseLora] = useState(true);
  const [loraKey, setLoraKey] = useState(LORA_OPTIONS[0].key);
  const [loraConfig, setLoraConfig] = useState({
    name: LORA_OPTIONS[0].filename,
    trigger: LORA_OPTIONS[0].trigger,
    strengthModel: LORA_OPTIONS[0].defaultStrengthModel,
    strengthClip: LORA_OPTIONS[0].defaultStrengthClip,
    insertMode: 'prefix',
  });

  // Estado de job
  const [submitting, setSubmitting] = useState(false);
  const [imageId, setImageId] = useState(null);
  const [status, setStatus] = useState(null);
  const [finalUrl, setFinalUrl] = useState(null);
  const [authError, setAuthError] = useState('');
  const pollRef = useRef(null);

  // Cronómetro & progreso & cola
  const [elapsedSec, setElapsedSec] = useState(0);
  const [progress, setProgress] = useState(null);
  const [queueIndex, setQueueIndex] = useState(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Señal para refrescar biblioteca tras completar una imagen
  const [libraryRefreshTick, setLibraryRefreshTick] = useState(0);
  const bumpLibraryRefresh = () => setLibraryRefreshTick(t => t + 1);

  const goLogin = () => navigate('/login?error=unauthorized');

  const seedValue = useMemo(() => {
    if (!randomSeed && String(seed).trim() !== '') return Number(seed) || 0;
    return undefined;
  }, [randomSeed, seed]);

  const currentLora = useMemo(
    () => LORA_OPTIONS.find(o => o.key === loraKey) || LORA_OPTIONS[0],
    [loraKey]
  );

  const canSubmit = prompt.trim().length > 3 && !submitting && !loading && isLogged;

  useEffect(() => {
    if (!loading && !isLogged) setAuthError('Debes iniciar sesión para generar imágenes.');
    if (!loading && isLogged) setAuthError('');
  }, [loading, isLogged]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopTimers = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const startPolling = (id) => {
    if (!id) return;
    if (pollRef.current) clearInterval(pollRef.current);

    const tick = async () => {
      try {
        const resp = await getImageStatus(id, { t: Date.now() });
        const data = unwrapStatus(resp);

        setStatus(data.status ?? data.estado ?? null);

        const pct = parseProgress(data);
        if (pct !== null) setProgress(pct);

        setQueueIndex(
          data.colaIndex ?? data.queueIndex ?? data.queuePosition ?? null
        );

        if ((data.status ?? data.estado) === 'completada') {
          setFinalUrl(data.finalUrl);
          setProgress(p => (typeof p === 'number' && p < 100) ? 100 : 100);
          clearInterval(pollRef.current); pollRef.current = null;
          setSubmitting(false);
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
          // actualiza la biblioteca
          bumpLibraryRefresh();
        } else if ((data.status ?? data.estado) === 'error') {
          clearInterval(pollRef.current); pollRef.current = null;
          setSubmitting(false);
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        }
      } catch (e) {
        const code = e?.response?.status;
        if (code === 401) { stopTimers(); setSubmitting(false); setStatus(null); setAuthError('Debes iniciar sesión para generar imágenes.'); return; }
        if (code === 404) { stopTimers(); setStatus('error'); setSubmitting(false); return; }
        // errores transitorios: dejamos seguir
      }
    };

    tick(); // primer intento inmediato
    pollRef.current = setInterval(tick, 2500);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading || !prompt.trim() || submitting) return;
    if (!isLogged) {
      setAuthError('Debes iniciar sesión para generar imágenes.');
      setStatus(null);
      setSubmitting(false);
      return;
    }

    if (authError) setAuthError('');

    // reinicio de progreso, tiempo y cola
    setProgress(0);
    setElapsedSec(0);
    setQueueIndex(null);

    // iniciar cronómetro
    if (timerRef.current) clearInterval(timerRef.current);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    setSubmitting(true);
    setStatus('en_proceso');
    setFinalUrl(null);
    setImageId(null);

    try {
      const payload = {
        prompt: prompt.trim(),
        ratio,
        steps: canTuneSteps ? (Number(steps) || DEFAULT_STEPS) : DEFAULT_STEPS,
        filename_prefix: filenamePrefix || 'keiko',
        modo: 'normal',
      };
      if (seedValue !== undefined) payload.seed = seedValue;

      if (useLora && currentLora) {
        const loraPath = currentLora.folder
          ? `${currentLora.folder}/${currentLora.filename}`
          : currentLora.filename;

        payload.loraName = loraPath;
        payload.loraTrigger = currentLora.trigger;
        payload.loraStrengthModel = Number(loraConfig.strengthModel);
        payload.loraStrengthClip = Number(loraConfig.strengthClip);
        payload.loraInsertMode = loraConfig.insertMode; // 'prefix' | 'suffix'
      }

      const resp = await startText2Image(payload);
      const id = resp?.imageId || resp?.jobId;
      if (!id || !resp?.ok) throw new Error('El servidor no pudo iniciar la generación de la imagen.');

      setImageId(id);
      startPolling(id);

    } catch (err) {
      const code = err?.response?.status;
      if (code === 401) {
        setAuthError('Tu sesión no es válida o ha caducado. Inicia sesión para continuar.');
        setStatus(null);
      } else {
        console.error(err);
        setStatus('error');
      }
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-container">
        <header className="page-header">
          <h1>Generador de Imágenes con IA</h1>
          <p>Crea imágenes impactantes a partir de texto usando tecnología FLUX / ComfyUI.</p>
        </header>

        <InlineAlert message={authError} onLogin={goLogin} />

        {loading ? (
          <div className="main-content">
            <section className="control-panel" style={{ opacity: 0.6 }}>Cargando…</section>
            <section className="preview-panel">
              <div className="placeholder">Cargando…</div>
            </section>
          </div>
        ) : (
        <>
        <main className="main-content">
          <ControlPanel
            prompt={prompt} setPrompt={setPrompt}
            ratio={ratio} setRatio={setRatio}
            steps={steps} setSteps={setSteps}
            seed={seed} setSeed={setSeed}
            randomSeed={randomSeed} setRandomSeed={setRandomSeed}
            filenamePrefix={filenamePrefix} setFilenamePrefix={setFilenamePrefix}
            useLora={useLora} setUseLora={setUseLora}
            loraKey={loraKey} setLoraKey={setLoraKey}
            loraConfig={loraConfig} setLoraConfig={setLoraConfig}
            onSubmit={onSubmit}
            canSubmit={canSubmit}
            submitting={submitting}
            canTuneSteps={canTuneSteps}
            progress={progress}
          />
          <ImagePreview
            status={status}
            finalUrl={finalUrl}
            progress={progress}
            elapsedSec={elapsedSec}
            queueIndex={queueIndex}
          />
        </main>
        <StatusDisplay
          status={status}
          imageId={imageId}
          progress={progress}
          elapsedSec={elapsedSec}
          queueIndex={queueIndex}
        />

        {/* === Biblioteca bajo el componente actual === */}
        <UserImageLibrary
          isLogged={isLogged}
          onNeedLogin={goLogin}
          refreshSignal={libraryRefreshTick}
        />
        </>)}
      </div>

      <style>{`
        :root {
          --color-primary: #3b82f6;
          --color-primary-hover: #2563eb;
          --color-text-primary: #e2e8f0;
          --color-text-secondary: #94a3b8;
          --color-bg-primary: #0f172a;
          --color-bg-secondary: #1e293b;
          --color-border: #334155;
          --color-success: #22c55e;
          --color-warning: #f59e0b;
          --color-error: #ef4444;
          --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          --border-radius: 8px;
        }
        body { font-family: var(--font-family-sans); background-color: var(--color-bg-primary); color: var(--color-text-primary); margin: 0; }
        * { box-sizing: border-box; }

        .page-container { max-width: 1500px; margin: 0 auto; padding: 2rem; }
        .page-header { text-align: center; margin-bottom: 2.5rem; }
        .page-header h1 { font-size: 2.5rem; font-weight: 800; letter-spacing: -0.05em; color: #fff; margin-bottom: 0.5rem; }
        .page-header p { font-size: 1.125rem; color: var(--color-text-secondary); }

        .main-content { display: grid; grid-template-columns: 520px 1fr; gap: 2rem; }
        @media (max-width: 1200px) { .main-content { grid-template-columns: 1fr; } }

        .control-panel {
          background-color: var(--color-bg-secondary);
          border-radius: var(--border-radius);
          padding: 1.5rem 2rem;
          display: flex; flex-direction: column; gap: 1.5rem;
          border: 1px solid var(--color-border);
        }

        .form-field { display: flex; flex-direction: column; gap: 0.6rem; }
        .form-field label { font-weight: 500; font-size: 0.875rem; color: var(--color-text-secondary); }
        .form-field .hint { color: var(--color-text-secondary); font-size: 0.75rem; opacity: .8; }

        input[type="text"], input[type="number"], select, textarea {
          width: 100%; background-color: var(--color-bg-primary);
          border: 1px solid var(--color-border); border-radius: 6px;
          padding: 0.75rem; color: var(--color-text-primary); font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        input:focus, select:focus, textarea:focus {
          outline: none; border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
        input:disabled { background-color: #334155; cursor: not-allowed; }
        textarea { resize: vertical; min-height: 120px; }
        .grid-col-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .grid-col-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }

        .checkbox-align-center { display: flex; align-items: flex-end; height: 100%; padding-bottom: 0.75rem; }
        .checkbox-control { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; user-select: none; }
        .checkbox-control input[type="checkbox"] { width: 1.25em; height: 1.25em; accent-color: var(--color-primary); }

        .lora-section { background-color: rgba(15, 23, 42, 0.7); border: 1px solid var(--color-border);
          border-radius: var(--border-radius); padding: 1rem 1.25rem; transition: all 0.3s ease; }
        .lora-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
        .lora-header strong { font-size: 1rem; color: var(--color-text-primary); }
        .accordion-toggle { font-size: 0.875rem; color: var(--color-text-secondary); }
        .lora-body { margin-top: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .meta-muted { margin-top: .35rem; color: var(--color-text-secondary); font-size: .8rem; }

        .submit-button {
          display: flex; align-items: center; justify-content: center; gap: 0.75rem;
          background-color: var(--color-primary); color: #fff; font-size: 1rem; font-weight: 600;
          padding: 0.875rem 1.5rem; border: none; border-radius: var(--border-radius);
          cursor: pointer; transition: background-color 0.2s; margin-top: 0.5rem; min-height: 48px;
        }
        .submit-button:hover:not(:disabled) { background-color: var(--color-primary-hover); }
        .submit-button:disabled { background-color: #334155; cursor: not-allowed; opacity: 0.7; }
        .submit-button .spinner { animation: spin 1s linear infinite; }

        .preview-panel { display: flex; align-items: center; justify-content: center;
          background-color: var(--color-bg-secondary); border-radius: var(--border-radius);
          border: 1px solid var(--color-border); overflow: hidden; min-height: 500px; }
        .image-container { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .image-container img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem;
          color: var(--color-text-secondary); }
        .placeholder svg { width: 48px; height: 48px; opacity: 0.5; }
        .placeholder .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .status-display { margin-top: 1.5rem; padding: 0.75rem 1.25rem; border-radius: var(--border-radius);
          font-size: 0.9rem; text-align: center; border: 1px solid transparent; text-transform: capitalize; }
        .status-en_proceso { background-color: rgba(245, 159, 11, 0.1); border-color: var(--color-warning); color: var(--color-warning); }
        .status-completada { background-color: rgba(34, 197, 94, 0.1); border-color: var(--color-success); color: var(--color-success); }
        .status-error { background-color: rgba(239, 68, 68, 0.1); border-color: var(--color-error); color: var(--color-error); }

        /* progreso y tiempo */
        .elapsed { font-size: 0.95rem; color: var(--color-text-secondary); }
        .progress-wrap {
          width: 260px; max-width: 80vw; height: 10px;
          border: 1px solid var(--color-border);
          background: rgba(15, 23, 42, 0.6);
          border-radius: 999px; overflow: hidden;
        }
        .progress-bar { height: 100%; background: var(--color-primary); transition: width .35s ease; }
        .progress-label { margin-top: .35rem; font-size: .9rem; color: var(--color-text-secondary); }

        /* =====================
           Biblioteca
           ===================== */
        .library-section {
          margin-top: 2rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius);
          padding: 1.25rem 1.25rem 1.5rem;
        }
        .library-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1rem;
        }
        .library-header h2 { margin: 0; font-size: 1.25rem; }
        .library-controls {
          display: flex; gap: .75rem; align-items: center; margin-bottom: 1rem; flex-wrap: wrap;
        }
        .library-search, .library-sort {
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
        }
        .btn {
          background: var(--color-primary);
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 0.5rem .9rem;
          cursor: pointer;
        }
        .btn.subtle {
          background: transparent; color: var(--color-text-primary);
          border: 1px solid var(--color-border);
        }
        .library-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 0.75rem;
        }
        .library-card {
          margin: 0; padding: 0; border: 1px solid var(--color-border);
          border-radius: 10px; overflow: hidden; background: rgba(15,23,42,.5);
          cursor: pointer; transition: transform .15s ease, box-shadow .15s ease;
        }
        .library-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,.2); }
        .library-card img { width: 100%; height: 180px; object-fit: cover; display: block; }
        .library-card figcaption {
          padding: .5rem .6rem; font-size: .85rem; color: var(--color-text-secondary);
          border-top: 1px solid var(--color-border);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .library-empty, .library-error {
          text-align: center; color: var(--color-text-secondary); padding: 1rem 0;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,.6);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 1rem;
        }
        .modal-dialog {
          background: var(--color-bg-secondary); color: var(--color-text-primary);
          border: 1px solid var(--color-border); border-radius: 10px;
          width: min(1024px, 96vw); max-height: 92vh; display: flex; flex-direction: column;
        }
        .modal-header, .modal-footer {
          padding: .75rem .9rem; border-bottom: 1px solid var(--color-border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .modal-footer { border-top: 1px solid var(--color-border); border-bottom: none; gap: .75rem; }
        .modal-close {
          background: transparent; border: none; color: var(--color-text-primary);
          font-size: 1.1rem; cursor: pointer;
        }
        .modal-body {
          padding: .75rem .9rem; overflow: auto; display: grid; gap: .75rem;
          grid-template-columns: 1fr 320px;
        }
        .modal-body img { width: 100%; height: auto; border-radius: 8px; border: 1px solid var(--color-border); }
        .modal-meta { font-size: .9rem; color: var(--color-text-secondary); display: grid; gap: .5rem; }
        .modal-prompt {
          white-space: pre-wrap; background: rgba(15,23,42,.5);
          border: 1px solid var(--color-border); padding: .5rem .6rem; border-radius: 6px;
        }
          /* Lista compacta de detalles clave */
        .info-list { display: grid; gap: .45rem; }
        .info-item {
          display: grid;
          grid-template-columns: 150px minmax(0,1fr);
          gap: .5rem;
          align-items: center;
          padding: .25rem .3rem;
          border-bottom: 1px dashed rgba(148,163,184,.25);
        }
        .info-item:last-child { border-bottom: 0; }
        .info-item .k { color: var(--color-text-secondary); font-size: .92rem; }
        .info-item .v {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: .95rem;
          white-space: normal;
          word-break: break-word;
        }
      `}</style>
    </>
  );
}
