import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MetaTags from "../components/MetaTags";
import ShareFloatingBar from '../components/ShareFloatingBar';
// Ya no necesitamos importar ReactMarkdown, rehypeRaw ni remarkAutolinkLiteral
// import ReactMarkdown from "react-markdown";
// import rehypeRaw from "rehype-raw";
// import remarkAutolinkLiteral from "remark-autolink-literal";

import "../styles/BlogPost.css"; // Ruta a tu archivo CSS completo

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/blog/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("La publicación no se encontró.");
          }
          throw new Error(`Error al cargar el post: ${res.statusText}`);
        }
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error("Error al cargar el post:", err.message);
        setError(err.message || "Ocurrió un error al cargar la publicación.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const calculateReadingTime = (content) => {
    if (!content) return "1 min de lectura";
    const wordsPerMinute = 200;
    const noOfWords = content.split(/\s/g).length;
    const minutes = Math.ceil(noOfWords / wordsPerMinute);
    return `${minutes} min de lectura`;
  };

  // --- UI de Carga y Error ---
  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-message">Cargando publicación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">
          ¡Ups! {error}
        </p>
        <Link to="/blog" className="back-to-blog-link">
          <svg className="back-to-blog-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Volver al blog
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="loading-container">
        <p className="not-available-message">Publicación no disponible.</p>
      </div>
    );
  }

  // --- Renderizado del Post ---
  return (
    <article className="blog-post-container fade-in">
      {/* Botón de volver al blog */}
      <Link to="/blog" className="back-to-blog-link">
        <svg className="back-to-blog-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Volver al blog
      </Link>

      {/* Hero Section: Imagen de portada, título y metadatos */}
      <div className="hero-section">
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title || "Imagen de portada de la publicación"}
            className="cover-image"
          />
        )}
        <div className={`post-header ${post.coverImage ? 'post-header-overlay' : ''}`}>
          <h1 className="post-title">
            {post.title}
          </h1>
          <div className="post-meta">
            <p>
              Publicado el{" "}
              <time dateTime={post.createdAt}>
                {new Date(post.createdAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </p>
            {post.content && (
              <>
                <span className="post-meta-separator">•</span>
                <p>{calculateReadingTime(post.content)}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contenido del post */}
      {/* Vuelve a la lógica original de split para auto-detectar enlaces en texto plano */}
      <div className="post-content">
        {post.content.split(/\n{2,}/g).map((block, idx) => (
          <p key={idx} className="content-paragraph">
            {block.trim().split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
              part.match(/^https?:\/\/[^\s]+$/) ? (
                <a
                  key={i}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="content-link" // Clase específica para enlaces auto-detectados en el contenido
                >
                  <span>📎</span> Ver enlace
                </a>
              ) : (
                part
              )
            )}
          </p>
        ))}
      </div>

      {/* Galería de imágenes */}
      {post.images?.length > 0 && (
        <div className="image-gallery-section">
          <h2 className="image-gallery-title">Galería de Imágenes</h2>
          <div className="image-gallery-grid">
            {post.images.map((img, i) => (
              <div key={i} className="gallery-item">
                <img
                  src={img}
                  alt={`${post.title} - Galería Imagen ${i + 1}`}
                  className="gallery-image"
                />
                <div className="gallery-overlay">
                  <span className="gallery-overlay-text">Ver Imagen</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de autor/fuente */}
      {post.fuente && (
        <div className="post-source-info">
          <p className="source-author">
            📝 Publicado por <strong>@keikodev.es</strong>
          </p>
          <p className="source-link-container">
            Fuente original:{" "}
            {/* Vuelve al enlace directo para la fuente */}
            <a
              href={post.fuente}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="source-link"
            >
              <span>🔗</span> Fuente original
            </a>
          </p>
        </div>
      )}
      <ShareFloatingBar
      title={post.title}
      description={post.summary || post.content.slice(0, 150)}
      imageUrl={post.coverImage}
      shareUrl={`https://keikodev.es/blog/${slug}`}
    />
    </article>
  );
};

export default BlogPost;