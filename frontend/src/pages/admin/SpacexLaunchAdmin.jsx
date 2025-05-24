import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/SpacexLaunchAdmin.css';
import Swal from 'sweetalert2';

const SpacexLaunchAdmin = () => {
  const [launches, setLaunches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [webcastUrl, setWebcastUrl] = useState('');

  useEffect(() => {
    fetchLaunches();
  }, []);


  const showDescriptionAlert = ({ title, description, tags }) => {
    Swal.fire({
        title: title || 'Descripción generada',
        html: `
        <pre style="text-align:left;white-space:pre-wrap;font-size:0.95rem">${description}</pre>
        <hr/>
        <strong>Etiquetas:</strong> ${tags?.join(', ') || ''}
        `,
        width: '60%',
        confirmButtonText: 'Cerrar'
    });
    };

  const fetchLaunches = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/spacex/all`);
      setLaunches(res.data);
    } catch (err) {
      console.error('Error al cargar lanzamientos:', err);
    }
  };

  const handleEnrichLaunch = async (id) => {
    if (!window.confirm('¿Seguro que quieres enriquecer este lanzamiento?')) return;
    try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/enrich-one-launch`, { id });
        alert(res.data.message || 'Enriquecido correctamente');
        fetchLaunches(); // Actualizar la tabla
    } catch (err) {
        console.error('Error al enriquecer:', err);
        alert('❌ Error al enriquecer el lanzamiento');
    }
    };

    const handleGeneratePost = async (id) => {
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/spacex/generate-post/${id}`);
            const { title, description, tags } = res.data.youtubePost;

            showDescriptionAlert({ title, description, tags }); // 👈 ahora pasamos un objeto
            fetchLaunches(); // 🔁 recargar la tabla con datos actualizados
        } catch (err) {
            console.error('Error generando post para YouTube:', err);
            alert('❌ Error generando post');
        }
        };


  const handleEdit = (id, currentUrl) => {
    setEditingId(id);
    setWebcastUrl(currentUrl || '');
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/spacex/${id}/webcast`, {
        webcastManual: webcastUrl, // ✅ esto es lo correcto
        });
      setEditingId(null);
      fetchLaunches(); // recargar lista actualizada
    } catch (err) {
      console.error('Error al actualizar webcast:', err);
    }
  };

  return (
    <div className="spacex-admin-container">
      <h2>🚀 Gestión de lanzamientos SpaceX</h2>
      <table className="spacex-admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Fecha</th>
            <th>Cohete</th>
            <th>Webcast</th>
            <th>URL oficial</th>
            <th>Manual</th>
            <th>Enriquecido</th>
            <th>Acciones</th>
            <th>Post generado</th>
          </tr>
        </thead>
        <tbody>
          {launches.map((l) => (
            <tr key={l._id}>
              <td>{l.name}</td>
              <td>{new Date(l.net).toLocaleString()}</td>
              <td>{l.rocket?.configuration?.full_name || '-'}</td>
              <td>
                {editingId === l._id ? (
                  <input
                    type="text"
                    value={webcastUrl}
                    onChange={(e) => setWebcastUrl(e.target.value)}
                  />
                ) : (
                  <a href={l.webcastManual || l.webcast} target="_blank" rel="noreferrer">
                    {(l.webcastManual || l.webcast) ? 'Ver' : 'N/A'}
                    </a>
                )}
              </td>
              <td>
                {l.highlightedVideo || l.webcast ? (
                    <a href={l.highlightedVideo || l.webcast} target="_blank" rel="noreferrer">
                    Ver
                    </a>
                ) : (
                    '—'
                )}
                </td>

                <td>
                {l.webcastManualEmbed ? (
                    <span style={{ color: 'limegreen' }}>🎯</span>
                ) : l.webcastManual ? (
                    <span style={{ color: 'orange' }}>📝</span>
                ) : (
                    <span style={{ color: '#aaa' }}>—</span>
                )}
                </td>
              <td>{l.isEnriched ? '✅' : '❌'}</td>
              <td>
                {l.youtubePost ? (
                    <button
                    onClick={() =>
                        Swal.fire({
                        title: l.youtubePost.title || 'Título del Post',
                        html: `
                            <pre style="text-align:left;white-space:pre-wrap;font-size:0.95rem">${l.youtubePost.description}</pre>
                            <hr/>
                            <strong>Etiquetas:</strong> ${l.youtubePost.tags?.join(', ') || ''}
                        `,
                        width: '60%',
                        confirmButtonText: 'Cerrar'
                        })
                    }
                    title="Ver descripción del post"
                    >
                    👁️
                    </button>
                    ) : '—'}

                </td>
              <td>
                {editingId === l._id ? (
                  <button onClick={() => handleSave(l._id)} title="Guardar cambios">💾</button>
                ) : (
                  <button onClick={() => handleEdit(l._id, l.webcastManual)} title="Editar Webcast">✏️</button>
                )}
                <button onClick={() => handleEnrichLaunch(l._id)} title="Enriquecer datos">⚙️</button>
                <button onClick={() => handleGeneratePost(l._id)} title="Generar descripción para YouTube">📄</button>
                
              </td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SpacexLaunchAdmin;
