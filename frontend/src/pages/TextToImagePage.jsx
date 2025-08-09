// src/pages/TextToImagePage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { startText2Image, getImageStatus } from '../services/text2imageApi';
import { useUser } from '../context/UserContext';

// --- Constantes y Configuración ---
const RATIOS = ['1:1', '2:3', '3:2', '3:4', '4:3', '16:9', '9:16'];
const DEFAULT_STEPS = 10;

// Opciones LoRA (con soporte de carpeta/archivo)
const LORA_OPTIONS = [
  {
    key: 'aidmaHyperrealism',
    label: 'Aidma Hyperrealism (FLUX v0.3)',
    folder: '', // raíz
    filename: 'aidmaHyperrealism-FLUX-v0.3.safetensors',
    trigger: 'aidmaHyperrealism',
    defaultStrengthModel: 0.7,
    defaultStrengthClip: 1.0,
  },
  {
    key: 'designtshirt',
    label: 'T-Shirt Design Marvel',
    folder: '', // carpeta
    filename: 'd3s1gntsh1rt-designtshirt-flux.safetensors', // archivo
    trigger: 'd3s1gntsh1rt',
    defaultStrengthModel: 1.0,
    defaultStrengthClip: 1.0,
  },
  // 👉 añade más LoRAs aquí
];

// --- Iconos SVG para una UI más rica ---
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

// --- Componentes de UI Modulares ---
const FormField = ({ label, children, hint }) => (
  <div className="form-field">
    <label>{label}</label>
    {children}
    {hint ? <small className="hint">{hint}</small> : null}
  </div>
);

const LoraControls = ({
  useLora, setUseLora,
  loraKey, setLoraKey,
  loraConfig, setLoraConfig,
  submitting
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const current = useMemo(
    () => LORA_OPTIONS.find(o => o.key === loraKey) || LORA_OPTIONS[0],
    [loraKey]
  );

  // cuando cambia el LoRA, hidrata name/trigger/strengths por defecto
  useEffect(() => {
    if (!current) return;
    setLoraConfig(prev => ({
      ...prev,
      // para referencia interna, guardamos el path completo que mostraremos
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
              <input
                type="text"
                value={current?.trigger || ''}
                readOnly
                disabled
              />
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
        </div>
      )}
    </div>
  );
};

const ControlPanel = ({
  prompt, setPrompt, ratio, setRatio, steps, setSteps, seed, setSeed,
  randomSeed, setRandomSeed, filenamePrefix, setFilenamePrefix,
  useLora, setUseLora, loraKey, setLoraKey, loraConfig, setLoraConfig,
  onSubmit, canSubmit, canTuneSteps, submitting
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
          disabled={!canTuneSteps || submitting}   // ⬅️ bloqueo visual
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
    />

    <button onClick={onSubmit} disabled={!canSubmit} className="submit-button">
      {submitting ? (
        <>
          <IconLoader />
          Generando...
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

const ImagePreview = ({ status, finalUrl }) => (
  <section className="preview-panel">
    <div className="image-container">
      {status === 'completada' && finalUrl ? (
        <img src={finalUrl} alt="Resultado de la generación" />
      ) : status === 'en_proceso' ? (
        <div className="placeholder">
          <IconLoader />
          <span>Generando imagen...</span>
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

const StatusDisplay = ({ status, imageId }) => {
  if (!status) return null;
  return (
    <div className={`status-display status-${status}`}>
      <strong>Estado:</strong> {status.replace('_', ' ')}
      {imageId && <> · <strong>ID:</strong> {imageId}</>}
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
  const { user } = useUser() || {};
  const role = user?.role || localStorage.getItem('role') || 'free';
  const canTuneSteps = role === 'pro' || role === 'admin';

  // LoRA
  const [useLora, setUseLora] = useState(true);
  const [loraKey, setLoraKey] = useState(LORA_OPTIONS[0].key);
  const [loraConfig, setLoraConfig] = useState({
    name: LORA_OPTIONS[0].filename,              // se hidrata con useEffect
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
  const pollRef = useRef(null);

  // Helpers
  const seedValue = useMemo(() => {
    if (!randomSeed && String(seed).trim() !== '') return Number(seed) || 0;
    return undefined;
  }, [randomSeed, seed]);

  const currentLora = useMemo(
    () => LORA_OPTIONS.find(o => o.key === loraKey) || LORA_OPTIONS[0],
    [loraKey]
  );

  const canSubmit = prompt.trim().length > 3 && !submitting;

  // Polling
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPolling = (id) => {
    if (!id) return;
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const data = await getImageStatus(id);
        setStatus(data.status);
        if (data.status === 'completada') {
          setFinalUrl(data.finalUrl);
          clearInterval(pollRef.current);
          pollRef.current = null;
          setSubmitting(false);
        } else if (data.status === 'error') {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setSubmitting(false);
        }
      } catch (e) {
        if (e?.response?.status === 404) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setStatus('error');
          setSubmitting(false);
        }
      }
    }, 2500);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setStatus('en_proceso');
    setFinalUrl(null);
    setImageId(null);

    try {
      const payload = {
        prompt: prompt.trim(), // el backend insertará el trigger con coma
        ratio,
        steps: canTuneSteps ? (Number(steps) || DEFAULT_STEPS) : DEFAULT_STEPS, // ⬅️ fuerza
        filename_prefix: filenamePrefix || 'keiko',
        modo: 'normal',
      };
      if (seedValue !== undefined) payload.seed = seedValue;

      if (useLora && currentLora) {
        // Construye path para Comfy: folder/filename o solo filename
        const loraPath = currentLora.folder
          ? `${currentLora.folder}/${currentLora.filename}`
          : currentLora.filename;

        payload.loraName = loraPath;
        payload.loraTrigger = currentLora.trigger; // bloqueado
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
      console.error(err);
      setStatus('error');
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
            canTuneSteps={canTuneSteps}   // ⬅️ nuevo prop
          />
          <ImagePreview status={status} finalUrl={finalUrl} />
        </main>
        <StatusDisplay status={status} imageId={imageId} />
      </div>

      <style jsx global>{`
        /* --- ESTILOS GLOBALES Y RESET --- */
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
          cursor: pointer; transition: background-color 0.2s; margin-top: 0.5rem;
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
      `}</style>
    </>
  );
}
