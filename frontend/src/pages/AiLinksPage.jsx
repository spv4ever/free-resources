import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ResourcesPage.css';
import { FaExternalLinkAlt, FaYoutube } from 'react-icons/fa';
import AdBanner from '../components/AdBanner';

function AiLinksPage() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTipo, setSelectedTipo] = useState('Todos');

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
  

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/aitools`);
        setTools(res.data);
      } catch (error) {
        console.error('Error al cargar herramientas AI:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);
  //const tiposDisponibles = ['Todos', ...new Set(tools.map(tool => tool.tipo))];
  return (
    <div className="resources">
      <AdBanner />
      <h2 className="category-title" style={{ marginTop: '1rem' }}>Herramientas de Inteligencia Artificial</h2>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
      <select
          value={selectedTipo}
          onChange={(e) => setSelectedTipo(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            width: '60%',
            maxWidth: '300px'
          }}
        >
          <option value="Todos">Todos</option>
          {tiposDisponibles.map((tipo) => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </select>
        </div>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="categories-container">
          {tools
            .filter(tool => selectedTipo === 'Todos' || tool.tipo === selectedTipo)
            .map(tool => (
            <div key={tool._id} className="category-card" style={{ width: '300px' }}>
              <h3>{tool.herramientaAI}</h3>
              <p>{tool.descripcion}</p>
              <p><strong>Tipo:</strong> {
                  tiposDisponibles.find(t => t.value === tool.tipo)?.label || tool.tipo
                }</p>
              <p><strong>⭐️</strong> {'⭐️'.repeat(tool.estrellas || 0)}</p>
              <p><strong>Plan Gratuito:</strong> {tool.planGratuito ? '✔️' : '❌'}</p>
              <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                <button
  className="icon-button"
  style={{ backgroundColor: '#007bff', width: '60px', color: '#fff' }}
  title="Ir a la herramienta"
  onClick={() => window.open(tool.url, '_blank')}
>
  <FaExternalLinkAlt />
</button>
                {tool.url_formacion && (
                  <button
  className="icon-button"
  style={{ backgroundColor: '#dc3545', width: '60px', color: '#fff' }}
  title="Ver formación"
  onClick={() => window.open(tool.url_formacion, '_blank')}
>
  <FaYoutube />
</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AiLinksPage;
