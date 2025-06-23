import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import '../styles/UserProfile.css';
import BotonBiblioteca from '../components/BotonBiblioteca';

const UserProfile = () => {
  const { user, setUser } = useUser();
  const [editNickname, setEditNickname] = useState(user?.nickname || '');
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveNickname = async () => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/auth/profile`,
        { nickname: editNickname },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const updatedNickname = res.data.nickname;
      setUser((prev) => ({ ...prev, nickname: updatedNickname }));
      setMessage('Apodo actualizado correctamente');
      setEditing(false);
    } catch (err) {
      console.error(err);
      setMessage('Error al actualizar el apodo');
    }
  };

  if (!user) return <p>Cargando perfil...</p>;

  return (
    <div className="profile-container">
      <h2>Perfil de usuario</h2>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Rol:</strong> {user.role}</p>

      <div className="nickname-section">
        <label><strong>Apodo:</strong></label>
        {editing ? (
          <>
            <input
              type="text"
              value={editNickname}
              onChange={(e) => setEditNickname(e.target.value)}
              maxLength={50}
            />
            <button onClick={handleSaveNickname}>Guardar</button>
            <button onClick={() => setEditing(false)}>Cancelar</button>
          </>
        ) : (
          <>
            <span style={{ marginLeft: '0.5rem' }}>{user.nickname || 'No establecido'}</span>
            <button onClick={() => setEditing(true)} style={{ marginLeft: '1rem' }}>Editar</button>
          </>
        )}
      </div>

      {message && <p className="success-message">{message}</p>}
      <div className="top-bar">
              <BotonBiblioteca />
      </div>
    </div>
  );
};

export default UserProfile;
