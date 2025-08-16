// src/components/admin/AdminImport.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './AdminImport.css';

const exampleJson = [
  {
    scene: "Titular para lanzamiento de producto",
    prompt: "Escribe un titular de no más de 10 palabras que enfatice la novedad y la urgencia del lanzamiento de un smartwatch con monitor de salud avanzado.",
    platform: "ChatGPT",
    access: "free",
    nsfw: false,
    fixedOptions: {
      tono: [
        {
          name: "urgente",
          label: "Urgente",
          group: { name: "tono", label: "Tono", multiple: false }
        },
        {
          name: "emocional",
          label: "Emocional",
          group: { name: "tono", label: "Tono", multiple: false }
        }
      ]
    }
  },
  {
    scene: "Descripción breve de producto",
    prompt: "Genera en 2–3 frases una descripción del nuevo altavoz Bluetooth portátil, resaltando su batería de larga duración y resistencia al agua.",
    platform: "ChatGPT",
    access: "free",
    nsfw: false,
    fixedOptions: {
      longitud: [
        {
          name: "corta",
          label: "Corta",
          group: { name: "longitud", label: "Longitud", multiple: false }
        }
      ]
    }
  }
];

const REQUIRED_FIELDS = ['scene', 'prompt', 'platform', 'access', 'nsfw'];

export default function AdminImport() {
  const [importMode, setImportMode] = useState('file'); // 'file' | 'text'
  const [file, setFile] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [jsonTextStats, setJsonTextStats] = useState(null); // {count, missingFields: {...}}
  const [jsonTextError, setJsonTextError] = useState(null);

  const [packs, setPacks] = useState([]);
  const [selectedPack, setSelectedPack] = useState('');

  const [previewData, setPreviewData] = useState([]);
  const [checked, setChecked] = useState({});
  const [allChecked, setAllChecked] = useState(true);

  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    axios.get(`${API}/api/keiko/packs`)
      .then(res => setPacks(res.data))
      .catch(() => setPacks([]));
  }, [API]);

  // ===== Utilidades =====
  const resetPreview = () => {
    setPreviewData([]);
    setChecked({});
    setAllChecked(true);
    setImportResult(null);
    setError(null);
  };

  const downloadExample = () => {
    const blob = new Blob([JSON.stringify(exampleJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ejemplo_prompts.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildCheckedMap = (data) => {
    const init = {};
    data.forEach(item => { init[item._idx] = true; });
    return init;
  };

  const validateItems = (arr) => {
    // Devuelve campos faltantes por índice
    const missingFields = {};
    arr.forEach((item, i) => {
      const missing = REQUIRED_FIELDS.filter(k => !(k in item));
      if (missing.length) missingFields[i] = missing;
    });
    return missingFields;
  };

  // ===== Modo Archivo =====
  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setJsonText('');
    setJsonTextError(null);
    setJsonTextStats(null);
    resetPreview();
  };

  const previewFromFile = async () => {
    if (!file || !selectedPack) return;
    setLoadingPreview(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('packId', selectedPack);

      const res = await axios.post(
        `${API}/api/keiko/import/preview`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const data = Array.isArray(res.data.preview) ? res.data.preview : [];
      setPreviewData(data);
      setChecked(buildCheckedMap(data));
      setAllChecked(true);
    } catch (e) {
      setError('Error al generar previsualización desde archivo');
    } finally {
      setLoadingPreview(false);
    }
  };

  // ===== Modo Texto =====
  const analyzeJsonText = (text) => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        return { error: 'El JSON debe ser un array de objetos', data: null };
      }
      const withIndex = parsed.map((item, idx) => ({ ...item, _idx: idx }));
      const missing = validateItems(withIndex);
      return {
        error: null,
        data: withIndex,
        stats: { count: withIndex.length, missingFields: missing }
      };
    } catch (err) {
      return { error: `JSON inválido: ${err.message}`, data: null };
    }
  };

  const previewFromText = async () => {
    if (!selectedPack) return;
    setLoadingPreview(true);
    setError(null);
    setJsonTextError(null);
    setJsonTextStats(null);

    const result = analyzeJsonText(jsonText);
    if (result.error) {
      setJsonTextError(result.error);
      setLoadingPreview(false);
      return;
    }

    // Opción A: previsualización local (sin backend)
    setPreviewData(result.data);
    setChecked(buildCheckedMap(result.data));
    setAllChecked(true);
    setJsonTextStats(result.stats);

    // Opción B (opcional): validación servidor. Descomenta si montas el endpoint.
    /*
    try {
      const res = await axios.post(
        `${API}/api/keiko/import/preview-text`,
        { packId: selectedPack, json: result.data }, // o jsonText si el servidor espera string
        { headers: { 'Content-Type': 'application/json' } }
      );
      const data = Array.isArray(res.data.preview) ? res.data.preview : result.data;
      setPreviewData(data);
      setChecked(buildCheckedMap(data));
      setAllChecked(true);
    } catch (e) {
      // Si falla el servidor, mantenemos previsualización local
    } finally {
      setLoadingPreview(false);
    }
    */

    setLoadingPreview(false);
  };

  // ===== Acciones comunes =====
  const toggleCheck = (idx) => {
    setChecked(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleAll = () => {
    const next = !allChecked;
    const newChecked = {};
    previewData.forEach(item => { newChecked[item._idx] = next; });
    setChecked(newChecked);
    setAllChecked(next);
  };

  const handleImport = async () => {
    const prompts = previewData;
    const acceptedIndexes = Object.entries(checked)
      .filter(([_, v]) => v)
      .map(([k]) => parseInt(k, 10));

    if (!acceptedIndexes.length) return;

    setIsImporting(true);
    setProgressMessage(`Importando 0 de ${acceptedIndexes.length}...`);
    setError(null);
    setImportResult(null);

    try {
      const res = await axios.post(
        `${API}/api/keiko/import/import`,
        { packId: selectedPack, prompts, acceptedIndexes }
      );
      setImportResult({
        imported:  res.data.insertedCount,
        skipped:   res.data.skippedCount,
        message:   res.data.message
      });
      setProgressMessage(res.data.message || 'Importación completada');
    } catch (e) {
      setError('Error en importación definitiva');
      setProgressMessage('');
    } finally {
      setTimeout(() => {
        setIsImporting(false);
        setProgressMessage('');
      }, 800);
    }
  };

  // Limpia previsualización al cambiar de pack o modo
  useEffect(() => {
    resetPreview();
    setFile(null);
    setJsonText('');
    setJsonTextError(null);
    setJsonTextStats(null);
  }, [selectedPack, importMode]);

  const missingSummary = useMemo(() => {
    if (!jsonTextStats?.missingFields) return null;
    const entries = Object.entries(jsonTextStats.missingFields);
    if (entries.length === 0) return 'Todos los elementos incluyen los campos requeridos.';
    const count = entries.length;
    return `Hay ${count} elemento(s) con campos faltantes (scene, prompt, platform, access, nsfw). Puedes importarlos igualmente, pero revisa esos casos.`;
  }, [jsonTextStats]);

  return (
    <div className="admin-import">
      <h2>Importar Prompts desde JSON</h2>

      {/* Selector de pack + modo */}
      <div className="controls">
        <select
          value={selectedPack}
          onChange={e => setSelectedPack(e.target.value)}
          disabled={isImporting}
        >
          <option value="">Selecciona pack</option>
          {packs.map(pack => (
            <option key={pack._id} value={pack._id}>
              {pack.title}
            </option>
          ))}
        </select>

        <div className="mode-switch">
          <button
            type="button"
            className={importMode === 'file' ? 'active' : ''}
            onClick={() => setImportMode('file')}
            disabled={isImporting}
          >
            Archivo JSON
          </button>
          <button
            type="button"
            className={importMode === 'text' ? 'active' : ''}
            onClick={() => setImportMode('text')}
            disabled={isImporting}
          >
            Pegar JSON
          </button>
        </div>

        <button
          className="button-secondary"
          onClick={downloadExample}
          disabled={isImporting}
        >
          Descargar JSON de ejemplo
        </button>
      </div>

      {/* Zona de carga según modo */}
      {importMode === 'file' ? (
        <div className="file-zone">
          <input
            type="file"
            accept="application/json"
            onChange={handleFileChange}
            disabled={isImporting}
            style={{ display: 'inline-block', opacity: 1, position: 'static', width: 'auto', height: 'auto' }}
          />

          <button
            className="button-primary"
            onClick={previewFromFile}
            disabled={!file || !selectedPack || loadingPreview || isImporting}
          >
            {loadingPreview ? 'Cargando...' : 'Previsualizar'}
          </button>
        </div>
      ) : (
        <div className="text-zone">
          <textarea
            placeholder='Pega aquí tu JSON (array de objetos con: scene, prompt, platform, access, nsfw, ...)'
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            rows={14}
            spellCheck={false}
            disabled={isImporting}
            style={{ width: '100%', fontFamily: 'monospace' }}
          />
          <div className="text-actions">
            <button
              className="button-primary"
              onClick={previewFromText}
              disabled={!jsonText.trim() || !selectedPack || loadingPreview || isImporting}
            >
              {loadingPreview ? 'Validando...' : 'Previsualizar'}
            </button>
            <span className="hint">El JSON debe ser un array de prompts. Los índices se asignan automáticamente.</span>
          </div>
          {jsonTextError && <p className="error">{jsonTextError}</p>}
          {jsonTextStats && (
            <div className="stats">
              <p><strong>Total elementos:</strong> {jsonTextStats.count}</p>
              {missingSummary && <p className="warn">{missingSummary}</p>}
            </div>
          )}
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {/* Previsualización */}
      {previewData.length > 0 && (
        <>
          <div className="preview-actions">
            <button onClick={toggleAll} disabled={isImporting}>
              {allChecked ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </button>
            <button
              className="button-primary"
              onClick={handleImport}
              disabled={isImporting}
            >
              Importar seleccionados
            </button>
          </div>

          <div className="preview-table-container">
            <table>
              <thead>
                <tr>
                  <th>✔︎</th>
                  <th>#</th>
                  <th>Scene</th>
                  <th>Prompt</th>
                  <th>Platform</th>
                  <th>Access</th>
                  <th>NSFW</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map(item => (
                  <tr key={item._idx}>
                    <td>
                      <input
                        type="checkbox"
                        checked={!!checked[item._idx]}
                        onChange={() => toggleCheck(item._idx)}
                        disabled={isImporting}
                      />
                    </td>
                    <td>{item._idx + 1}</td>
                    <td>{item.scene ?? <em className="warn">—</em>}</td>
                    <td className="col-prompt">{item.prompt ?? <em className="warn">—</em>}</td>
                    <td>{item.platform ?? <em className="warn">—</em>}</td>
                    <td>{item.access ?? <em className="warn">—</em>}</td>
                    <td>{(item.nsfw === true) ? 'Sí' : (item.nsfw === false ? 'No' : <em className="warn">—</em>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Resultado de la importación */}
      {importResult && (
        <div className="import-summary">
          <p className="success">{importResult.message}</p>
        </div>
      )}

      {/* Modal de progreso */}
      {isImporting && (
        <div className="import-modal">
          <div className="import-modal-content">
            <div className="spinner" />
            <p>{progressMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
