// src/hooks/useFavoriteToggle.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

export const useFavoriteToggle = () => {
  const { user } = useUser();
  const token = localStorage.getItem('token');
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true); // 🆕

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || !token) return setLoading(false);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/favorites`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ids = res.data.map(f => f.seriesId._id); // 👈 si usas populate('seriesId')
        setFavoriteIds(ids);
        console.log('🎯 IDs favoritos cargados:', ids);
      } catch (err) {
        console.error('Error al cargar favoritos:', err);
      } finally {
        setLoading(false); // ✅ importante
      }
    };

    fetchFavorites();
  }, [user, token]);

  const toggleFavorite = async (mongoId) => {
    if (!user || !token || loading) return; // ⛔ no permitir acción hasta que haya cargado

    try {
      const url = `${process.env.REACT_APP_API_URL}/api/user/favorites/${mongoId}`;
      if (favoriteIds.includes(mongoId)) {
        await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
        setFavoriteIds(prev => prev.filter(id => id !== mongoId));
      } else {
        await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
        setFavoriteIds(prev => [...prev, mongoId]);
      }
    } catch (err) {
      console.error('Error al actualizar favoritos:', err);
    }
  };

  const isFavorite = (mongoId) => favoriteIds.includes(mongoId);
    
  return { favoriteIds, isFavorite, toggleFavorite, loading };
};
