import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminUsersPage.css';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(res.data);
    } catch (err) {
      setError('Error al cargar usuarios');
    }
  };

  const handleAdjustTokens = async () => {
    const numericValue = parseInt(adjustAmount, 10);
    
    if (isNaN(numericValue)) {
      return alert('Introduce una cantidad válida');
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/api/tokens/balance/${selectedUser._id}`, {
        amount: numericValue,
        reason: adjustReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('✅ Tokens ajustados correctamente');
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error('❌ Error al ajustar tokens:', err);
      alert('Error al ajustar tokens');
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/users/${userId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers(); // recarga
    } catch (err) {
      console.error('Error al actualizar:', err);
      alert('No se pudo actualizar el usuario');
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const openTokenModal = (user) => {
    setSelectedUser(user);
    setAdjustAmount(''); // ← iniciar como texto vacío
    setAdjustReason('');
  };

  return (
    <div className="admin-users-container">
      <h2>👤 Gestión de usuarios</h2>
      {error && <p className="error">{error}</p>}
      <table className="admin-users-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Rol</th>
            <th>Tokens</th>
            <th>Verificado</th>
            <th>Fecha de registro</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.email}</td>
              <td>
                <select
                    value={user.role}
                    onChange={(e) => updateUser(user._id, { role: e.target.value })}
                >
                    <option value="free">free</option>
                    <option value="pro">pro</option>
                    <option value="admin">admin</option>
                </select>
                </td>
                <td>
                  {user.tokenBalance ?? '—'} 
                  <button onClick={() => openTokenModal(user)}>✏️</button>
                </td>
                <td>
                <input
                    type="checkbox"
                    checked={user.isVerified}
                    onChange={(e) => updateUser(user._id, { isVerified: e.target.checked })}
                />
                </td>

                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>

            </tr>
          ))}
        </tbody>
      </table>
      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Editar tokens de {selectedUser.email}</h3>
            <input
              type="text"
              placeholder="Cantidad (ej: 10 o -5)"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
            />
            <input
              type="text"
              placeholder="Motivo del ajuste"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handleAdjustTokens}>Guardar</button>
              <button onClick={() => setSelectedUser(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsersPage;
