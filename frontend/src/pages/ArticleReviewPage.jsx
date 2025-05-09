import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ArticleReviewPage.css';

const ArticleReviewPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/email-articles`, {
          params: { reviewed: 'false' }
        });
        setArticles(res.data);
      } catch (err) {
        console.error('Error al obtener artículos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleApprove = async (id) => {
    try {
        alert('✅ Artículo aprobado y marcado para post.');
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/admin/email-articles/${id}/approve`, {
        approve: true
      });
      setArticles(prev => prev.map(a => a._id === id ? { ...a, status: 'aprobado' } : a));
    } catch (err) {
      console.error('Error al aprobar artículo:', err);
    }
  };

  const handleReject = async (id) => {
    try {
        alert('❌ Artículo rechazado.');
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/admin/email-articles/${id}/review`);
      setArticles(prev => prev.map(a => a._id === id ? { ...a, status: 'rechazado' } : a));
    } catch (err) {
      console.error('Error al rechazar artículo:', err);
    }
  };

  const handleGeneratePosts = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/email-articles/generate-posts`);
      alert(`✅ Se generaron ${res.data.created} post(s) desde artículos aprobados.`);
    } catch (err) {
      console.error('Error al generar posts:', err);
      alert('❌ Error al generar los posts.');
    }
  };

  return (
    <div className="article-review-page">
      <h1>📰 Revisión de Noticias Capturadas</h1>
        <button onClick={handleGeneratePosts} className="generate-posts-btn">📝 Generar Posts Aprobados</button>

  
      {loading ? (
        <p>⌛ Cargando artículos...</p>
      ) : (
        <>
          <p>🔍 Artículos encontrados: {articles.length}</p>
          {articles.length === 0 ? (
            <div className="email-empty">
                <p>🎉 No hay artículos pendientes de revisión.</p>
                <p>Puedes importar nuevos correos o generar los posts desde los aprobados.</p>
            </div>
            ) : (
            <ul className="articles-list">
              {articles.map((article) => (
                <li key={article._id} className="article-item">
                    <h3>{article.title}</h3>
                    <p>{article.description}</p>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">🔗 Ver fuente</a>
                    {article.status === 'aprobado' && <span className="status-approved">✅ Aprobado</span>}  {/* 👈 Aquí sí es válido */}
                    <div className="actions">
                    <button onClick={() => handleApprove(article._id)}>✅ Aprobar</button>
                    <button onClick={() => handleReject(article._id)}>❌ Rechazar</button>
                    </div>
                </li>
                ))}
              
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default ArticleReviewPage;
