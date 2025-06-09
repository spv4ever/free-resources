import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/KeikoAdmin.css';

const KeikoImportAdmin = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [selected, setSelected] = useState([]);
  const [importedCount, setImportedCount] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target.result);
        const token = localStorage.getItem('token');
        const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/keiko/import-preview`,
        json,
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        setPreview(res.data.prompts || []);
        setSelected([]);
        setImportedCount(0);
      } catch (err) {
        alert('❌ Error al procesar el archivo JSON');
      }
    };
    reader.readAsText(selectedFile);
    setFile(selectedFile);
  };

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleImport = async () => {
  const token = localStorage.getItem('token'); // Asegúrate de tenerlo guardado al hacer login

    const promptsToImport = preview
        .filter(p => selected.includes(p.tempId) && p.valid)
        .map(p => ({
        scene: p.scene,
        prompt: p.prompt,
        nsfw: p.nsfw,
        pack: {
            title: p.packTitle,
            platform: p.platform,
            category: p.category,
            access: p.access
        },
        fixedOptions: {} // puedes actualizar esto si añades filtros
        }));

    try {
        const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/keiko/import-confirmed`,
        promptsToImport,
        {
            headers: {
            Authorization: `Bearer ${token}`
            }
        }
        );
        setImportedCount(promptsToImport.length);
        alert(res.data.message || '✅ Prompts importados correctamente');
    } catch (err) {
        alert('❌ Error al importar prompts seleccionados');
    }
    };


  return (
    <div className="keiko-admin-wrapper">
      <h2>📦 Importar Prompts desde JSON</h2>

      <input type="file" accept=".json" onChange={handleFileChange} />
      {file && (
        <p><strong>Archivo cargado:</strong> {file.name}</p>
      )}

      {preview.length > 0 && (
        <>
          <p><strong>Total detectados:</strong> {preview.length}</p>
          <p><strong>Seleccionados:</strong> {selected.length}</p>
          <button onClick={handleImport} className="btn-accent">🚀 Importar seleccionados</button>

          <table className="keiko-admin-table" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th></th>
                <th>Pack</th>
                <th>Plataforma</th>
                <th>Categoría</th>
                <th>Acceso</th>
                <th>NSFW</th>
                <th>Escena</th>
                <th>Prompt</th>
              </tr>
            </thead>
            <tbody>
              {preview.map(p => (
                <tr key={p.tempId} style={{ opacity: p.valid ? 1 : 0.4 }}>
                  <td>
                    <input
                      type="checkbox"
                      disabled={!p.valid}
                      checked={selected.includes(p.tempId)}
                      onChange={() => toggleSelect(p.tempId)}
                    />
                  </td>
                  <td>{p.packTitle}</td>
                  <td>{p.platform}</td>
                  <td>{p.category}</td>
                  <td>{p.access}</td>
                  <td>{p.nsfw ? '✔️' : '❌'}</td>
                  <td>{p.scene}</td>
                  <td>{p.prompt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {importedCount > 0 && (
        <p style={{ marginTop: '1rem', color: 'green' }}>
          ✅ {importedCount} prompts importados correctamente.
        </p>
      )}
    </div>
  );
};

export default KeikoImportAdmin;
