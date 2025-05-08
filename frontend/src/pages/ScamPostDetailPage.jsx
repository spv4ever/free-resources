import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/ScamPostDetailPage.css';

const ScamPostDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/scam-posts/${id}`)
      .then(res => setPost(res.data))
      .catch(() => setError('No se pudo cargar la noticia.'));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!post) return <p className="loading">Cargando noticia...</p>;

  return (
    <div className="scam-post-detail">
      <h1>{post.titulo}</h1>
      <p className="fecha">{new Date(post.createdAt).toLocaleDateString('es-ES')}</p>
      <p className="clasificacion">Clasificación: <strong>{post.clasificacion}</strong></p>
      <div className="post-body">
      {post.redaccion
        .split(/\n{2,}/g) // dividir por saltos dobles
        .flatMap((block) => {
            // Si detectamos lista numerada (1. 2. 3. ...)
            if (/^\s*\d+\.\s/.test(block.trim())) {
            return block.split(/(?=\d+\.\s)/g).map((item, i) => (
                <p key={`list-${i}`} style={{ paddingLeft: '1rem' }}>🔹 {item.trim()}</p>
            ));
            }

            // Párrafo normal
            return <p key={block.slice(0, 10)}>{block.trim()}</p>;
        })}
        </div>
        <hr style={{ margin: '2rem 0', borderColor: '#333' }} />
        <p style={{ fontSize: '0.9rem', color: '#aaa', textAlign: 'center' }}>
        📝 Publicado por <strong>@keikodev.es</strong><br />
        Fuente original: <a href={post.fuente} target="_blank" rel="noopener noreferrer" style={{ color: '#00bfff' }}>
            {post.fuente}
        </a>
        </p>
    </div>
  );
};

export default ScamPostDetailPage;
