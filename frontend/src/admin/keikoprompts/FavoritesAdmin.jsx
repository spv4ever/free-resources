// src/admin/keikoprompts/FavoritesAdmin.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/PromptAdmin.css';

const FavoritesAdmin = () => {
  const [userId, setUserId] = useState('');
  const [favorites, setFavorites] = useState([]);

  const fetchFavorites = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/favorites/${userId}`);
      setFavorites(res.data);
    } catch (err) {
      console.error('Error al obtener favoritos', err);
    }
  };

  return (
    <div className="keiko-admin-wrapper">
      <h2>⭐ Favoritos de Usuario</h2>

      <div className="keiko-admin-form">
        <input
          placeholder="ID del usuario"
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
        <button onClick={fetchFavorites}>🔍 Ver favoritos</button>
      </div>

      <table className="keiko-admin-table">
        <thead>
          <tr>
            <th>Prompt</th>
            <th>Escena</th>
          </tr>
        </thead>
        <tbody>
          {favorites.map(fav => (
            <tr key={fav._id}>
              <td>{fav.prompt?.prompt}</td>
              <td>{fav.prompt?.scene}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FavoritesAdmin;
