import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import '../styles/KeikoPromptList.css';

const KeikoPromptList = () => {
  const { packId } = useParams();
  const [pack, setPack] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    const fetchPackDetails = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/prompt-packs/${packId}`);
        setPack(res.data.pack);
        setPrompts(res.data.prompts);
        setLoading(false);
      } catch (err) {
        console.error('Error cargando el pack:', err);
        setLoading(false);
      }
    };
    fetchPackDetails();
  }, [packId]);

  if (loading) return <p>Cargando prompts...</p>;
  if (!pack) return <p>❌ Pack no encontrado.</p>;

  // Acceso no logado
  if (!user) {
    return (
      <div className="keiko-access-denied">
        <h3>🔒 Acceso restringido</h3>
        <p>Este pack requiere inicio de sesión.</p>
        <a href="/login" className="btn-accent">🔑 Iniciar sesión</a>
      </div>
    );
  }

  // Validación de acceso por rol
  const userRole = user.role || 'free';
  const accessAllowed =
    pack.access === 'free' ||
    (pack.access === 'pro' && (userRole === 'pro' || userRole === 'admin')) ||
    userRole === 'admin';

  if (!accessAllowed) {
    return (
      <div className="keiko-access-denied">
        <h3>🚫 Pack exclusivo para usuarios PRO</h3>
        <p>Este contenido está disponible solo para miembros PRO.</p>
        <a href="/perfil" className="btn-accent">💎 Hazte PRO</a>
      </div>
    );
  }

  return (
    <div className="keiko-promptlist-wrapper">
      {pack && (
        <div className="keiko-sticky-pack-header">
          <button onClick={() => navigate('/keikoprompts')} className="btn-accent">
            ← Volver a la lista de packs
          </button>
          <h2>📦 {pack.title}</h2>
          <p>
            <strong>Plataforma:</strong> {pack.platform} |
            <strong> Categoría:</strong> {pack.category} |
            <strong> Acceso:</strong> {pack.access}
          </p>
          {pack.description && <p>{pack.description}</p>}
        </div>
      )}

      <div className="keiko-promptlist">
        {prompts.map((item) => (
          <div key={item._id} className="prompt-item">
            <h4>📌 {item.scene}</h4>
            <pre>{item.prompt}</pre>
            <button onClick={() => navigator.clipboard.writeText(item.prompt)}>📋 Copiar Prompt</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeikoPromptList;
