import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../../styles/BlogForm.css'; // para BlogCreate y BlogEdit
const API_URL = process.env.REACT_APP_API_URL;

const BlogEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [images, setImages] = useState([""]);
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
        const res = await fetch(`${API_URL}/api/blog/id/${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        });
        if (!res.ok) return alert("Error al cargar la entrada");
        const data = await res.json();
        setTitle(data.title);
        setSummary(data.summary || "");
        setContent(data.content);
        setCoverImage(data.coverImage || "");
        setImages(data.images?.length ? data.images : [""]);
        setFeatured(data.featured || false);
    };
    fetchPost();
    }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      title,
      summary,
      content,
      coverImage,
      images: images.filter((img) => img),
      featured,
    };

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/api/blog/${id}`, {
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    });

    if (res.ok) {
      navigate("/admin/blog");
    } else {
      alert("Error al actualizar la entrada.");
    }
  };

  return (
    <section className="blog-form-container">
      <h1 className="text-2xl font-bold mb-4">Editar entrada</h1>
      <form onSubmit={handleSubmit} className="blog-form">

        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <textarea
          placeholder="Resumen"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full border p-2 rounded"
          rows={3}
        />

        <textarea
          placeholder="Contenido"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border p-2 rounded"
          rows={10}
          required
        />

        <input
          type="text"
          placeholder="URL de imagen de portada"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <div>
          <label className="block font-medium mb-1">Imágenes adicionales:</label>
          {images.map((img, index) => (
            <input
              key={index}
              type="text"
              value={img}
              placeholder={`Imagen ${index + 1}`}
              onChange={(e) => {
                const updated = [...images];
                updated[index] = e.target.value;
                setImages(updated);
              }}
              className="w-full border p-2 rounded mb-2"
            />
          ))}
          <button
            type="button"
            onClick={() => setImages([...images, ""])}
            className="text-sm text-blue-600"
          >
            + Añadir otra imagen
          </button>
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          <span>Destacar en portada</span>
        </label>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Guardar cambios
        </button>
      </form>
    </section>
  );
};

export default BlogEdit;
