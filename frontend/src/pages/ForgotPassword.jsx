import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, { email });
      setMessage(res.data.message || 'Hemos enviado un correo si tu email está registrado.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Ocurrió un error al intentar recuperar la contraseña.');
    }
  };

  return (
    <div className="forgot-container">
      <h2>¿Olvidaste tu contraseña?</h2>
      <form onSubmit={handleSubmit}>
        <label>Ingresa tu email:</label>
        <input
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tucorreo@ejemplo.com"
        />
        <button type="submit">Enviar enlace</button>
      </form>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-box">{error}</p>}
    </div>
  );
};

export default ForgotPassword;
