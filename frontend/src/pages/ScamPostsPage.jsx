// src/pages/ScamPostsPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ScamPostsPage.css';
import { useNavigate } from 'react-router-dom'; // ✅ nuevo

const ScamPostsPage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/scam-posts/all`)
      .then(res => setPosts(res.data))
      .catch(err => {
        console.error('Error al cargar las noticias de estafas:', err);
        setPosts([]);
      });
  }, []);
  const navigate = useNavigate();
  return (
    <div className="scam-posts-page">
      <h1>🛡️ Noticias sobre Ciberestafas</h1>
      <div className="scam-posts-grid">
        {posts.map((post) => (
            <div
            key={post._id}
            className="scam-card"
            onClick={() => navigate(`/scam-posts/${post._id}`)}
          >
            <h3>{post.clasificacion}</h3>
            <p className="resumen">{post.titulo}</p>
            <p className="detalle">{post.redaccion.slice(0, 160)}...</p>
            <p className="fecha">{new Date(post.createdAt).toLocaleDateString('es-ES')}</p> {/* ✅ Fecha añadida */}
          </div>
        ))}
        </div>
    </div>
  );
};

export default ScamPostsPage;
