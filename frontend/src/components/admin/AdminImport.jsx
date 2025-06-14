// src/components/admin/AdminImport.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminImport.css';

const exampleJson = [
  {
    "scene":    "Titular para lanzamiento de producto",
    "prompt":   "Escribe un titular de no más de 10 palabras que enfatice la novedad y la urgencia del lanzamiento de un smartwatch con monitor de salud avanzado.",
    "platform": "ChatGPT",
    "access":   "free",
    "nsfw":     false,
    "fixedOptions": {
      "tono": [
        {
          "name": "urgente",
          "label":"Urgente",
          "group": {
            "name":     "tono",
            "label":    "Tono",
            "multiple": false
          }
        },
        {
          "name": "emocional",
          "label":"Emocional",
          "group": {
            "name":     "tono",
            "label":    "Tono",
            "multiple": false
          }
        }
      ]
    }
  },
  {
    "scene":    "Descripción breve de producto",
    "prompt":   "Genera en 2–3 frases una descripción del nuevo altavoz Bluetooth portátil, resaltando su batería de larga duración y resistencia al agua.",
    "platform": "ChatGPT",
    "access":   "free",
    "nsfw":     false,
    "fixedOptions": {
      "longitud": [
        {
          "name": "corta",
          "label":"Corta",
          "group": {
            "name":     "longitud",
            "label":    "Longitud",
            "multiple": false
          }
        }
      ]
    }
  }
];

export default function AdminImport() {
  const [file, setFile] = useState(null);
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

  const handleFileChange = e => {
    setFile(e.target.files[0]);
    setPreviewData([]);
    setImportResult(null);
    setError(null);
  };

  const handlePreview = async () => {
    if (!file || !selectedPack) return;
    setLoadingPreview(true);
    setError(null);
    const form = new FormData();
    form.append('file', file);
    form.append('packId', selectedPack);

    try {
      const res = await axios.post(
        `${API}/api/keiko/import/preview`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const data = res.data.preview;
      setPreviewData(data);
      const init = {};
      data.forEach(item => { init[item._idx] = true });
      setChecked(init);
      setAllChecked(true);
    } catch {
      setError('Error al generar previsualización');
    } finally {
      setLoadingPreview(false);
    }
  };

  const toggleCheck = idx => {
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
      // esperamos { insertedCount, skippedCount, message }
      setImportResult({
        imported:    res.data.insertedCount,
        skipped:     res.data.skippedCount,
        message:     res.data.message
      });
      setProgressMessage(res.data.message);
    } catch {
      setError('Error en importación definitiva');
      setProgressMessage('');
    } finally {
      setTimeout(() => {
        setIsImporting(false);
        setProgressMessage('');
      }, 1000);
    }
  };

  const downloadExample = () => {
    const blob = new Blob([JSON.stringify(exampleJson, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ejemplo_prompts.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-import">
      <h2>Importar Prompts desde JSON</h2>

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

        <input
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          disabled={isImporting}
        />

        <button
          className="button-primary"
          onClick={handlePreview}
          disabled={!file || !selectedPack || loadingPreview || isImporting}
        >
          {loadingPreview ? 'Cargando...' : 'Previsualizar'}
        </button>

        <button
          className="button-secondary"
          onClick={downloadExample}
          disabled={isImporting}
        >
          Descargar JSON de ejemplo
        </button>
      </div>

      {error && <p className="error">{error}</p>}

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
                        checked={checked[item._idx]}
                        onChange={() => toggleCheck(item._idx)}
                        disabled={isImporting}
                      />
                    </td>
                    <td>{item._idx + 1}</td>
                    <td>{item.scene}</td>
                    <td>{item.prompt}</td>
                    <td>{item.platform}</td>
                    <td>{item.access}</td>
                    <td>{item.nsfw ? 'Sí' : 'No'}</td>
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