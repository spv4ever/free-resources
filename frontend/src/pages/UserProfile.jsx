import axios from 'axios';
import { useUser } from '../context/UserContext';
import '../styles/UserProfile.css';
import BotonBiblioteca from '../components/BotonBiblioteca';
import { useToken } from '../context/TokenContext';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';



const UserProfile = () => {
  const { user, setUser } = useUser();
  const [editNickname, setEditNickname] = useState(user?.nickname || '');
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const { balance } = useToken();
  const [movimientos, setMovimientos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${process.env.REACT_APP_API_URL}/api/tokens/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(({ data }) => setMovimientos(data))
    .catch(err => console.error('❌ Error al cargar historial:', err));
  }, []);

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
        <div className="user-profile-balance">
          <h3>💰 Saldo de tokens</h3>
          <p>Tienes <strong>{balance}</strong> tokens disponibles.</p>
          <div className="token-info-link">
          <Link to="/info/tokens">ℹ️ ¿Cómo funcionan los tokens?</Link>
        </div>
        </div>
        <div className="user-profile-movimientos">
          <h3>📜 Historial de movimientos</h3>
          {movimientos.length === 0 ? (
            <p>No hay movimientos recientes.</p>
          ) : (
            <table className="tabla-movimientos">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Tokens</th>
                  <th>Tool</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m) => (
                  <tr key={m._id}>
                    <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                    <td>{m.type}</td>
                    <td style={{ color: m.amount > 0 ? 'lightgreen' : '#f77' }}>
                      {m.amount > 0 ? `+${m.amount}` : m.amount}
                    </td>
                    <td>{m.tool}</td>
                    <td>{m.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
