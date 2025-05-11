import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import '../styles/ResetPassword.css';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const validatePassword = (pwd) => ({
    minLength: pwd.length >= 8,
    hasNumber: /\d/.test(pwd),
    hasSymbol: /[^A-Za-z0-9]/.test(pwd),
    hasUppercase: /[A-Z]/.test(pwd)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setMessage('');

    if (newPassword !== repeatPassword) {
      setErrors(['Las contraseñas no coinciden.']);
      return;
    }

    const checks = validatePassword(newPassword);
    const failed = Object.entries(checks)
      .filter(([_, ok]) => !ok)
      .map(([k]) => {
        switch (k) {
          case 'minLength': return 'Al menos 8 caracteres';
          case 'hasNumber': return 'Debe incluir un número';
          case 'hasSymbol': return 'Debe incluir un símbolo';
          case 'hasUppercase': return 'Debe incluir una mayúscula';
          default: return '';
        }
      });

    if (failed.length > 0) {
      setErrors(failed);
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
        token,
        newPassword
      });

      setMessage(res.data.message);
      setNewPassword('');
      setRepeatPassword('');
      setTimeout(() => {
        navigate('/login');
      }, 3000); // redirige tras 3 segundos
    } catch (err) {
      setErrors([err.response?.data?.message || 'Error al restablecer la contraseña']);
    }
  };

  const checks = validatePassword(newPassword);

  return (
    <div className="reset-container">
      <h2>Restablecer contraseña</h2>
      <form onSubmit={handleSubmit}>
        <label>Nueva contraseña:</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        <ul className="password-check">
          <li style={{ color: checks.minLength ? 'green' : 'red' }}>✔ Al menos 8 caracteres</li>
          <li style={{ color: checks.hasUppercase ? 'green' : 'red' }}>✔ Una mayúscula</li>
          <li style={{ color: checks.hasNumber ? 'green' : 'red' }}>✔ Un número</li>
          <li style={{ color: checks.hasSymbol ? 'green' : 'red' }}>✔ Un símbolo</li>
        </ul>

        <label>Repite la nueva contraseña:</label>
        <input type="password" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} required />

        <button type="submit">Guardar contraseña</button>
      </form>

      {errors.length > 0 && (
        <div className="error-box">{errors.map((err, i) => <p key={i}>{err}</p>)}</div>
      )}
      {message && <p className="success-message">{message}</p>}
    </div>
  );
};

export default ResetPassword;
