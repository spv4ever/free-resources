import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import '../../styles/AiToolsAdmin.css';

function AiToolsAdminPage() {
  const [tools, setTools] = useState([]);
  const [newTool, setNewTool] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/aitools`)
      .then(res => setTools(res.data))
      .catch(err => console.error('Error al cargar IA tools:', err));
  }, []);

  const handleAdd = () => {
    setNewTool({
      herramientaAI: '',
      descripcion: '',
      url: '',
      tipo: '',
      planGratuito: false,
      estrellas: 1,
      icon: '',
      url_formacion: ''
    });
  };
  const tiposDisponibles = [
    { value: 'texto', label: 'Generación de texto' },
    { value: 'imagenes', label: 'Imágenes y arte AI' },
    { value: 'audio', label: 'Audio y voz' },
    { value: 'video', label: 'Video y animación' },
    { value: 'chatbot', label: 'Chatbots / Asistentes virtuales' },
    { value: 'productividad', label: 'Productividad / Automatización' },
    { value: 'educacion', label: 'Educación / Formación' },
    { value: 'programacion', label: 'Programación / Desarrollo' },
    { value: 'traduccion', label: 'Traducción / Lenguaje' },
    { value: 'investigacion', label: 'Investigación / Análisis de datos' },
    { value: 'marketing', label: 'Marketing y SEO' },
    { value: 'diseno', label: 'Diseño / UX' },
    { value: 'gestion', label: 'Gestión de tareas / flujos' },
    { value: 'finanzas', label: 'Finanzas / Negocios' },
    { value: 'otros', label: 'Otros / Misceláneos' },
  ];
  
  const handleSaveNew = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/aitools`, newTool, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTools([res.data, ...tools]);
      setNewTool(null);
    } catch (err) {
      console.error('Error al crear herramienta IA:', err);
    }
  };

  const handleEdit = (tool) => {
    
    setEditId(tool._id);
    setEditData({
        ...tool,
        tipo: tiposDisponibles.find(t => t.value === tool.tipo)?.value || 'otros'
      });
  };

  const handleSaveEdit = async () => {
    try {
      //console.log('Payload de edición:', editData);
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/aitools/${editId}`, editData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTools(tools.map(t => (t._id === res.data._id ? res.data : t)));
      setEditId(null);
      setEditData({});
    } catch (err) {
      console.error('Error al editar herramienta IA:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta herramienta?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/aitools/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTools(tools.filter(t => t._id !== id));
    } catch (err) {
      console.error('Error al eliminar herramienta IA:', err);
    }
  };

  return (
    <div className="ai-admin-container">
      <h2 className="ai-admin-title">Gestión de Herramientas IA</h2>

      <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
        <button className="ai-admin-add" onClick={handleAdd}>
          <FaPlus /> Añadir nueva
        </button>
      </div>

      <table className="ai-admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Tipo</th>
            <th>Gratis</th>
            <th>Valoración</th>
            <th>Enlace</th>
            <th>Formación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {newTool && (
            <tr>
              <td><input value={newTool.herramientaAI} onChange={e => setNewTool({ ...newTool, herramientaAI: e.target.value })} /></td>
              <td>
                <input
                    type="text"
                    value={newTool.descripcion}
                    onChange={(e) => setNewTool({ ...newTool, descripcion: e.target.value })}
                />
                </td>
              <td>
                <select
                    value={newTool.tipo}
                    onChange={(e) => setNewTool({ ...newTool, tipo: e.target.value })}
                >
                    {tiposDisponibles.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                    </option>
                    ))}
                </select>
                </td>
              <td><input type="checkbox" checked={newTool.planGratuito} onChange={e => setNewTool({ ...newTool, planGratuito: e.target.checked })} /></td>
              <td><input type="number" value={newTool.estrellas} onChange={e => setNewTool({ ...newTool, estrellas: e.target.value })} min="1" max="5" /></td>
              <td><input value={newTool.url} onChange={e => setNewTool({ ...newTool, url: e.target.value })} /></td>
              <td><input value={newTool.url_formacion} onChange={e => setNewTool({ ...newTool, url_formacion: e.target.value })} /></td>
              <td>
                <button onClick={handleSaveNew}><FaSave /></button>
                <button onClick={() => setNewTool(null)}><FaTimes /></button>
              </td>
            </tr>
          )}
          {tools.map(tool => (
            editId === tool._id ? (
              <tr key={tool._id}>
                <td><input value={editData.herramientaAI} onChange={e => setEditData({ ...editData, herramientaAI: e.target.value })} /></td>
                <td>
                    <input
                        type="text"
                        value={editData.descripcion}
                        onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                    />
                    </td>
                <td>
                    <select
                        value={editData.tipo}
                        onChange={(e) => setEditData({ ...editData, tipo: e.target.value })}
                    >
                        {tiposDisponibles.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                        </option>
                        ))}
                    </select>
                    </td>
                <td><input type="checkbox" checked={editData.planGratuito} onChange={e => setEditData({ ...editData, planGratuito: e.target.checked })} /></td>
                <td><input type="number" value={editData.estrellas} onChange={e => setEditData({ ...editData, estrellas: e.target.value })} min="1" max="5" /></td>
                <td><input value={editData.url} onChange={e => setEditData({ ...editData, url: e.target.value })} /></td>
                <td><input value={editData.url_formacion} onChange={e => setEditData({ ...editData, url_formacion: e.target.value })} /></td>
                <td>
                  <button onClick={handleSaveEdit}><FaSave /></button>
                  <button onClick={() => setEditId(null)}><FaTimes /></button>
                </td>
              </tr>
            ) : (
              <tr key={tool._id}>
                <td>{tool.herramientaAI}</td>
                <td>{tool.descripcion}</td>
                <td>{tool.tipo}</td>
                <td style={{ textAlign: 'center' }}>{tool.planGratuito ? '✔️' : '❌'}</td>
                <td style={{ textAlign: 'center' }}>{'⭐️'.repeat(tool.estrellas || 0)}</td>
                <td><a href={tool.url} target="_blank" rel="noreferrer">Ir</a></td>
                <td>{tool.url_formacion ? <a href={tool.url_formacion} target="_blank" rel="noreferrer">Ver</a> : '—'}</td>
                <td>
                  <button onClick={() => handleEdit(tool)}><FaEdit /></button>
                  <button onClick={() => handleDelete(tool._id)}><FaTrash /></button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AiToolsAdminPage;
