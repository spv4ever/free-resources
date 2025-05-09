import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/EmailReviewAdmin.css';

const EmailReviewAdmin = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEmailId, setExpandedEmailId] = useState(null);

  const fetchPendingEmails = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/email-entries?reviewed=false`);
      setEmails(res.data);
    } catch (err) {
      console.error('Error al cargar emails pendientes', err);
    } finally {
      setLoading(false);
    }
  };

  const approveEmail = async (id) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/admin/email-entries/${id}/approve`, { approve: true });
      setEmails(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      alert('Error al aprobar el email');
    }
  };

  const rejectEmail = async (id) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/admin/email-entries/${id}/review`);
      setEmails(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      alert('Error al rechazar el email');
    }
  };

  const extractSnippetsFromHtml = (html) => {
    try {
      if (!html) return ['(Sin contenido HTML)'];
      
      const scriptMatch = html.match(/<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/i);
      if (!scriptMatch) return ['(No se encontraron temas en el contenido del email)'];
  
      const jsonData = JSON.parse(scriptMatch[1]);
      const snippets = jsonData?.updates?.snippets?.map(s => s.message) || [];
      const links = jsonData?.cards?.[0]?.widgets?.map(w => ({
        title: w.title,
        description: w.description,
        url: w.url
      })) || [];
  
      return [...snippets, ...links];
    } catch (err) {
      return ['❌ No se pudo interpretar el contenido del correo.'];
    }
  };
  useEffect(() => {
    fetchPendingEmails();
  }, []);

  if (loading) return <p className="email-loading">Cargando emails pendientes...</p>;

  return (
    <div className="email-review-admin">
      <h2 className="email-title">📥 Revisión de Emails Capturados</h2>
      {emails.length === 0 ? (
        <p className="email-empty">No hay correos pendientes de revisión.</p>
      ) : (
        <ul className="email-list">
          {emails.map(email => {
            const isExpanded = expandedEmailId === email._id;
            const extra = isExpanded ? extractSnippetsFromHtml(email.html) : [];

            return (
              <li key={email._id} className="email-item">
                <div className="email-header">
                  <strong>{email.subject}</strong>
                  <span className="email-date">{new Date(email.date).toLocaleString()}</span>
                </div>
                <p className="email-snippet">{email.snippet}</p>
                <div className="email-actions">
                  <button className="approve-btn" onClick={() => approveEmail(email._id)}>✅ Aprobar</button>
                  <button className="reject-btn" onClick={() => rejectEmail(email._id)}>❌ Rechazar</button>
                  <button className="expand-btn" onClick={() => setExpandedEmailId(isExpanded ? null : email._id)}>
                    {isExpanded ? '🔽 Ocultar detalles' : '🔍 Ver detalles'}
                  </button>
                </div>
                {isExpanded && (
                  <div className="email-preview">
                    {extra.map((item, index) => {
                      if (typeof item === 'string') return <p key={index}>• {item}</p>;
                      return (
                        <div key={index} className="email-link-block">
                          <a href={item.url} target="_blank" rel="noopener noreferrer"><strong>{item.title}</strong></a>
                          <p>{item.description}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default EmailReviewAdmin;
