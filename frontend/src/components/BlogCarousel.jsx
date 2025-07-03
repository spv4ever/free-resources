import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "../styles/BlogCarousel.css";

const API_URL = process.env.REACT_APP_API_URL;

const BlogCarousel = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_URL}/api/blog?featured=true&limit=6`);
        if (!res.ok) throw new Error("Error al obtener entradas destacadas");
        const data = await res.json();

        // Eliminar duplicados por _id
        const uniquePosts = Array.from(
          new Map(data.posts.map((post) => [post._id, post])).values()
        );
        setPosts(uniquePosts);
      } catch (err) {
        console.error("Error cargando posts destacados:", err.message);
        setPosts([]);
      }
    };

    fetchFeatured();
  }, []);

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3, // Muestra 3 entradas a la vez
    slidesToScroll: 1,
    arrows: true,
    responsive: [
        {
        breakpoint: 1024,
        settings: {
            slidesToShow: 2,
        },
        },
        {
        breakpoint: 600,
        settings: {
            slidesToShow: 1,
        },
        },
    ],
    };

  return (
    <section className="dashboard-box">
      <h2 className="section-title">✨ Destacados del Blog</h2>
      {posts.length === 0 ? (
        <p className="carousel-empty">No hay entradas destacadas por ahora.</p>
      ) : (
        <Slider {...settings}>
          {posts.map((post) => (
            <div key={post._id}>
              <Link to={`/blog/${post.slug}`} className="carousel-item-link">
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="carousel-image"
                  />
                )}
                <h3 className="carousel-title">{post.title}</h3>
                <p className="carousel-summary">
                  {post.summary?.length > 120
                    ? post.summary.slice(0, 120) + "..."
                    : post.summary}
                </p>
              </Link>
            </div>
          ))}
        </Slider>
      )}
    </section>
  );
};

export default BlogCarousel;
