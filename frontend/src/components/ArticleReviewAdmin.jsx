import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ArticleReviewAdmin.css';

const ArticleReviewAdmin = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/email-articles?reviewed=false`);
      setArticles(res.data);
    } catch (err) {
      console.error('Error al cargar artículos pendientes', err);
    } finally {
      setLoading(false);
    }
  };

  const approveArticle = async (id) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/admin/email-articles/${id}/approve`, { approve: true });
      setArticles(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      alert('Error al aprobar el artículo');
    }
  };

  const rejectArticle = async (id) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/admin/email-articles/${id}/review`);
      setArticles(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      alert('Error al rechazar el artículo');
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  if (loading) return <p className="email-loading">Cargando artículos pendientes...</p>;

  return (
    <div className="email-review-admin">
      <h2 className="email-title">📰 Revisión de Noticias Capturadas</h2>
      {articles.length === 0 ? (
        <p className="email-empty">No hay artículos pendientes de revisión.</p>
      ) : (
        <ul className="email-list">
          {articles.map(article => (
            <li key={article._id} className="email-item">
              <div className="email-header">
                <strong>{article.title}</strong>
                <span className="email-date">{new Date(article.createdAt).toLocaleString()}</span>
              </div>
              <p className="email-snippet">{article.description}</p>
              <a href={article.url} target="_blank" rel="noopener noreferrer">🔗 Ver fuente</a>
              <div className="email-actions">
                <button className="approve-btn" onClick={() => approveArticle(article._id)}>✅ Aprobar</button>
                <button className="reject-btn" onClick={() => rejectArticle(article._id)}>❌ Rechazar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ArticleReviewAdmin;
