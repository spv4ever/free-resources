import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/ScamPostDetailPage.css';
import { useUser } from '../context/UserContext'; // 👈 importante

const ScamPostDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const { user } = useUser(); // 👈 obtiene el usuario actual

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/scam-posts/${id}`)
      .then(res => setPost(res.data))
      .catch(() => setError('No se pudo cargar la noticia.'));
  }, [id]);

  const handleCrearEntradaBlog = async () => {
    if (!post) return;

    const resumen = post.resumen || post.redaccion?.slice(0, 150) || 'Resumen no disponible.';
    const contenido = post.redaccion || '';

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/blog`, {
        title: post.titulo,
        summary: resumen,
        content: contenido,
        featured: false,
        coverImage: '',
        images: [],
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // ⬅️ Importante
          "Content-Type": "application/json"
        }
      });

      alert('✅ Entrada de blog creada correctamente.');
    } catch (err) {
      console.error(err);
      alert('❌ Error al crear la entrada del blog.');
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!post) return <p className="loading">Cargando noticia...</p>;

  return (
    <div className="scam-post-detail">
      <h1>{post.titulo}</h1>
      <p className="fecha">{new Date(post.createdAt).toLocaleDateString('es-ES')}</p>
      <p className="clasificacion">Clasificación: <strong>{post.clasificacion}</strong></p>

      <div className="post-body">
        {post.redaccion
          .split(/\n{2,}/g)
          .flatMap((block) => {
            if (/^\s*\d+\.\s/.test(block.trim())) {
              return block.split(/(?=\d+\.\s)/g).map((item, i) => (
                <p key={`list-${i}`} style={{ paddingLeft: '1rem' }}>🔹 {item.trim()}</p>
              ));
            }

            return (
              <p key={block.slice(0, 10)}>
                {block.trim().split(/(https?:\/\/[^\s]+)/g).map((part, index) =>
                  part.match(/^https?:\/\/[^\s]+$/) ? (
                    <a
                      key={`link-${index}`}
                      href={part}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#00bfff' }}
                    >
                      📎 Enlace
                    </a>
                  ) : (
                    part
                  )
                )}
              </p>
            );
          })}
      </div>

      <hr style={{ margin: '2rem 0', borderColor: '#333' }} />
      <p style={{ fontSize: '0.9rem', color: '#aaa', textAlign: 'center' }}>
        📝 Publicado por <strong>@keikodev.es</strong><br />
        Fuente original:{' '}
        <a
          href={post.fuente}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#00bfff' }}
        >
          📎 Fuente original
        </a>
      </p>

      {user?.role === 'admin' && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={handleCrearEntradaBlog}
            style={{
              backgroundColor: '#00bfff',
              color: 'white',
              padding: '10px 20px',
              fontSize: '1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            📝 Crear entrada de Blog
          </button>
        </div>
      )}
    </div>
  );
};

export default ScamPostDetailPage;
