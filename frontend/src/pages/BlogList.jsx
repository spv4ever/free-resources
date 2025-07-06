import { useEffect, useState } from "react";
// import MetaTags from '../components/MetaTags';
import { Link } from "react-router-dom";
import "../styles/BlogList.css";

const API_URL = process.env.REACT_APP_API_URL;

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 6;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/blog?page=${page}&limit=${limit}`);
        const data = await res.json();
        setPosts(data.posts);
        setTotal(data.total);
      } catch (err) {
        console.error("Error al cargar posts del blog:", err);
      }
    };
    fetchPosts();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <section className="blog-container">
      {/* <MetaTags 
        title="Blog de Keikodev - Tutoriales, IA y Desarrollo Web"
        description="Encuentra los últimos artículos y tutoriales sobre desarrollo web, inteligencia artificial, programación y tecnología en el blog de Keikodev."
      /> */}
      <h1 className="blog-title">📝 Blog Keiko</h1>

      <div className="blog-grid">
        {posts.map((post) => (
          <Link
            to={`/blog/${post.slug}`}
            key={post._id}
            className={`blog-card fade-in ${post.featured ? "featured-card" : ""}`}
          >
            {post.coverImage && (
              <img src={post.coverImage} alt={post.title} className="blog-image" />
            )}
            <div className="blog-card-content">
              <h2>{post.title}</h2>
              <p className="blog-date">
                {new Date(post.createdAt).toLocaleDateString("es-ES")}
              </p>
              <p className="blog-summary">{post.summary}</p>
              {post.featured && <span className="featured-label">✨ Destacado</span>}
            </div>
          </Link>
        ))}
      </div>

      {/* Paginación */}
      <div className="pagination-controls">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`pagination-button ${page === i + 1 ? "active" : ""}`}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </section>
  );
};

export default BlogList;
