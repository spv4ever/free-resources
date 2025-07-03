import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import '../../styles/BlogAdmin.css';

const API_URL = process.env.REACT_APP_API_URL;

const BlogAdmin = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
        const res = await fetch(`${API_URL}/api/blog`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        });

        if (!res.ok) throw new Error("Error al obtener las entradas");

        const data = await res.json();
        setPosts(data.posts);
    } catch (err) {
        console.error(err);
        alert("No se pudieron cargar las entradas del blog");
    }
    };

  const deletePost = async (id) => {
    if (!window.confirm("¿Eliminar esta entrada?")) return;
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/api/blog/${id}`, {
        method: "DELETE",
        headers: {
        Authorization: `Bearer ${token}`,
        },
    });

    if (res.ok) {
        fetchPosts(); // refresca la lista
    } else {
        alert("Error al eliminar.");
    }
    };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <section className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Blog</h1>
      <Link to="/admin/blog/create" className="bg-black text-white px-4 py-2 rounded">
        Crear nueva entrada
      </Link>

      <table className="w-full mt-6 text-left border-t">
        <thead>
          <tr>
            <th>Título</th>
            <th>Fecha</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post._id} className="border-b">
              <td>{post.title}</td>
              <td>{new Date(post.createdAt).toLocaleDateString()}</td>
              <td className="space-x-2 text-right">
                <Link
                  to={`/admin/blog/edit/${post._id}`}
                  className="text-blue-600 underline"
                >
                  Editar
                </Link>
                <button
                  onClick={() => deletePost(post._id)}
                  className="text-red-600 underline"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default BlogAdmin;
