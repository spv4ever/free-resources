import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import GifCard from './GifCard';

const API_URL = process.env.REACT_APP_API_URL;

const MisFavoritos = () => {
  const { user, token } = useUser();
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarFavoritos = async () => {
      if (!user || !token) return;

      try {
        const res = await axios.get(`${API_URL}/api/favoritos`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const gifsFormateados = res.data.map((f) => ({
          id: f.gifId,
          media_formats: {
            gif: {
              url: f.url
            }
          }
        }));

        setGifs(gifsFormateados);
      } catch (err) {
        console.error('❌ Error al cargar favoritos', err);
      } finally {
        setLoading(false);
      }
    };

    cargarFavoritos();
  }, [user, token]);

  if (!user || !token) {
    return <p style={{ color: '#aaa', fontStyle: 'italic' }}>Debes iniciar sesión para ver tus favoritos.</p>;
  }

  if (loading) {
    return <p style={{ color: '#aaa' }}>Cargando favoritos...</p>;
  }

  return (
  <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
    {user && (
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => window.location.href = '/gifs'}
          style={{
            padding: '0.4rem 0.8rem',
            backgroundColor: '#1f1f1f',
            color: '#fff',
            border: '1px solid #444',
            borderRadius: '999px',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1f1f1f'}
        >
          ← Volver a explorar
        </button>
      </div>
    )}

    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⭐ Mis GIFs Favoritos</h2>

    {gifs.length === 0 ? (
      <p style={{ color: '#888' }}>Aún no tienes ningún GIF en favoritos.</p>
    ) : (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        {gifs.map((gif) => (
          <GifCard
            key={gif.id}
            gif={gif}
            user={user}
            token={token}
            isFavorito={true}
          />
        ))}
      </div>
    )}
  </div>
);
};

export default MisFavoritos;
